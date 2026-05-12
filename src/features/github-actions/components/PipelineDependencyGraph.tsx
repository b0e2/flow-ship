import { CheckCircle2, CircleDashed, ExternalLink, Loader2, Minus, Plus, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WorkflowJob, WorkflowRun } from '../model/githubActions.types'
import type { PipelineNode } from '../model/pipeline.types'
import {
  formatDateTime,
  formatDuration,
  getShortSha,
} from '../utils/githubActionsUtils'
import {
  buildPipelineStagesFromJobs,
  findFailedPipelineNode,
  findRunningPipelineNode,
  getPipelineProgress,
} from '../utils/pipelineUtils'
import { PipelineStageColumn } from './PipelineStageColumn'

type PipelineDependencyGraphProps = {
  run: WorkflowRun | null
  jobs: WorkflowJob[]
  isLoading: boolean
}

function getProgressBarClass(progress: number) {
  if (progress === 100) return 'bg-gradient-to-r from-emerald-500 to-emerald-400'
  if (progress > 0) return 'bg-gradient-to-r from-sky-500 to-sky-400'
  return 'bg-slate-200 dark:bg-slate-700'
}

function getNodeStatusStyle(status: string) {
  if (status === 'success') return {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    bar: 'bg-emerald-400/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
  }
  if (status === 'failure') return {
    badge: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    bar: 'bg-red-400/60',
    icon: 'text-red-600 dark:text-red-400',
  }
  if (status === 'in_progress') return {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
    bar: 'bg-sky-400/60',
    icon: 'text-sky-600 dark:text-sky-400',
  }
  return {
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400',
    bar: 'bg-slate-300/60',
    icon: 'text-slate-500 dark:text-slate-400',
  }
}

export function PipelineDependencyGraph({
  isLoading,
  jobs,
  run,
}: PipelineDependencyGraphProps) {
  const stages = useMemo(() => buildPipelineStagesFromJobs(jobs), [jobs])
  const preferredNode =
    findRunningPipelineNode(stages) ?? findFailedPipelineNode(stages) ?? null
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null)
  const activeNode = selectedNode ?? preferredNode
  const progress = getPipelineProgress(stages)

  // Zoom / pan state
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const scaleRef = useRef(scale)
  const offsetRef = useRef(offset)
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const didMoveRef = useRef(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scaleRef.current = scale }, [scale])
  useEffect(() => { offsetRef.current = offset }, [offset])

  // Non-passive wheel listener to prevent page scroll while zooming
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const s = scaleRef.current
      const newScale = Math.min(4, Math.max(0.2, s * factor))
      setScale(newScale)
      setOffset({
        x: mx - (mx - offsetRef.current.x) * (newScale / s),
        y: my - (my - offsetRef.current.y) * (newScale / s),
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    // Don't intercept clicks on buttons/links inside the canvas
    if ((e.target as HTMLElement).closest('button, a')) return
    didMoveRef.current = false
    panStart.current = { x: e.clientX, y: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
    setIsPanning(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMoveRef.current = true
    setOffset({ x: panStart.current.ox + dx, y: panStart.current.oy + dy })
  }

  const handlePointerUp = () => setIsPanning(false)

  const zoomIn = () => setScale((s) => { const n = Math.min(4, s * 1.25); scaleRef.current = n; return n })
  const zoomOut = () => setScale((s) => { const n = Math.max(0.2, s / 1.25); scaleRef.current = n; return n })
  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  if (!run) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700/60 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">No data</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">
          파이프라인 그래프를 표시할 workflow run이 없습니다.
        </h2>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700/60 dark:bg-slate-900">
        <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-slate-400" />
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-700 dark:text-slate-300">
          파이프라인 로딩 중...
        </h2>
      </section>
    )
  }

  if (stages.length === 0) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700/60 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">No data</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-700 dark:text-slate-300">
          파이프라인 stage 데이터를 확인할 수 없습니다.
        </h2>
      </section>
    )
  }

  const nodeStyle = activeNode ? getNodeStatusStyle(activeNode.status) : null

  return (
    <section className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <div className="relative shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Pipeline Dependency Graph
            </p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {run.name ?? 'Unnamed workflow'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {run.head_branch ?? 'unknown branch'} ·{' '}
              <span className="font-mono">{getShortSha(run.head_sha)}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarClass(progress)}`}
                  style={{ width: `${progress.toString()}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
                {progress.toString()}%
              </span>
            </div>
            <a
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              href={run.html_url}
              rel="noreferrer"
              target="_blank"
            >
              Open in GitHub
              <ExternalLink aria-hidden="true" className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Pannable / zoomable canvas */}
      <div
        ref={canvasRef}
        className={`relative min-h-0 flex-1 overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/*
          Two-div zoom approach:
          - Outer translate: handles pan offset in screen-space
          - Inner zoom: CSS zoom property re-renders DOM at the target size (crisp at all zoom levels)
        */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${offset.x.toString()}px, ${offset.y.toString()}px)`,
          }}
        >
          <div
            style={{ zoom: scale }}
            className="flex items-start gap-0 p-6"
          >
            {stages.map((stage, index) => (
              <PipelineStageColumn
                isLast={index === stages.length - 1}
                key={stage.id}
                onSelectNode={(node) => {
                  if (!didMoveRef.current) setSelectedNode(node)
                }}
                selectedNodeId={activeNode?.id ?? null}
                stage={stage}
                stageIndex={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Zoom controls — outside canvas div, pointer events work normally */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/95">
        <button
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={zoomOut}
          type="button"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Reset zoom"
          className="min-w-[46px] rounded-lg px-1.5 py-1 text-[11px] font-bold tabular-nums text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={resetView}
          type="button"
        >
          {Math.round(scale * 100).toString()}%
        </button>
        <button
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={zoomIn}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          aria-label="Reset view"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={resetView}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Selected node detail panel */}
      {activeNode && nodeStyle ? (
        <aside className="absolute bottom-4 left-4 z-10 w-[400px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/97 shadow-2xl backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/97">
          {/* Top status bar */}
          <div className={`h-1 w-full ${nodeStyle.bar}`} />

          <div className="p-4">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {activeNode.source === 'job' ? 'Job' : `Step ${activeNode.stepNumber != null ? `#${activeNode.stepNumber.toString()}` : ''}`}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {activeNode.stageId}
                  </span>
                </div>
                <h3 className="mt-1 text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                  {activeNode.name}
                </h3>
                {activeNode.source === 'step' ? (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    in <span className="font-medium text-slate-600 dark:text-slate-300">{activeNode.jobName}</span>
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${nodeStyle.badge}`}>
                  {activeNode.status === 'in_progress' ? 'Running' : activeNode.status}
                </span>
                {activeNode.conclusion && activeNode.conclusion !== activeNode.status ? (
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    conclusion: <span className="font-semibold text-slate-600 dark:text-slate-300">{activeNode.conclusion}</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* ── Timeline ── */}
            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Timeline
              </p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-0">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Started</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {activeNode.startedAt ? formatDateTime(activeNode.startedAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Completed</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {activeNode.completedAt ? formatDateTime(activeNode.completedAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Duration</p>
                  <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">
                    {activeNode.durationSeconds != null && activeNode.durationSeconds > 0
                      ? formatDuration(activeNode.durationSeconds)
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Status detail ── */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Conclusion</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {activeNode.conclusion === 'success' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  ) : activeNode.conclusion === 'failure' ? (
                    <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <p className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
                    {activeNode.conclusion ?? 'In progress'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Type</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
                  {activeNode.source === 'job' ? '🔧 Job' : '📋 Step'}
                  {activeNode.stepNumber != null ? ` (${activeNode.stepNumber.toString()})` : ''}
                </p>
              </div>
            </div>

            {/* ── GitHub link ── */}
            {activeNode.htmlUrl ? (
              <a
                className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                href={activeNode.htmlUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span>GitHub에서 상세 로그 보기</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            ) : null}
          </div>
        </aside>
      ) : null}
    </section>
  )
}

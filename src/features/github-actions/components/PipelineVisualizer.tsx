import {
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDotDashed,
  ExternalLink,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkflowJob, WorkflowRun } from '../model/githubActions.types'
import type { PipelineNode, PipelineNodeStatus } from '../model/pipeline.types'
import {
  formatDateTime,
  formatDuration,
  getShortSha,
} from '../utils/githubActionsUtils'
import { buildPipelineNodes } from '../utils/pipelineUtils'

type PipelineVisualizerProps = {
  run: WorkflowRun | null
  jobs: WorkflowJob[]
  isLoading: boolean
}

function getNodeStyles(status: PipelineNodeStatus) {
  if (status === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  }

  if (status === 'failure') {
    return 'border-red-200 bg-red-50 text-red-900'
  }

  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50 text-blue-900'
  }

  if (status === 'queued') {
    return 'border-amber-200 bg-amber-50 text-amber-900'
  }

  if (status === 'skipped' || status === 'cancelled') {
    return 'border-slate-200 bg-slate-50 text-slate-500'
  }

  return 'border-slate-200 bg-white text-slate-800'
}

function getConnectorStyles(status: PipelineNodeStatus) {
  if (status === 'success') {
    return 'bg-emerald-300'
  }

  if (status === 'failure') {
    return 'bg-red-300'
  }

  if (status === 'in_progress') {
    return 'bg-blue-300'
  }

  if (status === 'queued') {
    return 'bg-amber-300'
  }

  return 'bg-slate-200'
}

function StatusIcon({ status }: { status: PipelineNodeStatus }) {
  if (status === 'success') {
    return <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'failure') {
    return <XCircle aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'in_progress') {
    return <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
  }

  if (status === 'queued') {
    return <CircleDotDashed aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'skipped' || status === 'cancelled') {
    return <CircleDashed aria-hidden="true" className="h-5 w-5" />
  }

  return <Circle aria-hidden="true" className="h-5 w-5" />
}

function PipelineNodeCard({
  isSelected,
  node,
  onSelect,
}: {
  isSelected: boolean
  node: PipelineNode
  onSelect: () => void
}) {
  const isActive = node.status === 'in_progress'

  return (
    <button
      className={`w-full min-w-[220px] rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:w-[240px] ${getNodeStyles(
        node.status,
      )} ${isSelected ? 'ring-2 ring-slate-950 ring-offset-2' : ''} ${
        isActive ? 'animate-pulse shadow-blue-200' : ''
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full bg-white/70 p-2 ${
            isActive ? 'shadow-[0_0_24px_rgba(37,99,235,0.45)]' : ''
          }`}
        >
          <StatusIcon status={node.status} />
        </span>
        <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold uppercase">
          {node.source}
        </span>
      </div>
      <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-6">
        {node.name}
      </h3>
      {node.source === 'step' ? (
        <p className="mt-2 text-xs font-medium opacity-75">{node.jobName}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold opacity-80">
        <span>{node.status}</span>
        <span>{formatDuration(node.durationInSeconds)}</span>
      </div>
    </button>
  )
}

function PipelineNodeDetail({ node }: { node: PipelineNode }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Selected {node.source}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {node.name}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Job: {node.jobName}
            {node.stepNumber ? ` · Step ${node.stepNumber.toString()}` : ''}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${getNodeStyles(
            node.status,
          )}`}
        >
          <StatusIcon status={node.status} />
          {node.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Duration
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatDuration(node.durationInSeconds)}
          </dd>
        </div>
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Started
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatDateTime(node.startedAt)}
          </dd>
        </div>
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Completed
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {formatDateTime(node.completedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-sm font-semibold text-slate-950">Detail / logs</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          GitHub Actions API의 jobs/steps 응답에는 step log 본문이 포함되지
          않습니다. 실제 로그와 annotation은 GitHub Actions 상세 화면에서
          확인하세요.
        </p>
        {node.htmlUrl ? (
          <a
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 hover:underline"
            href={node.htmlUrl}
            rel="noreferrer"
            target="_blank"
          >
            GitHub detail
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </aside>
  )
}

export function PipelineVisualizer({
  run,
  jobs,
  isLoading,
}: PipelineVisualizerProps) {
  const nodes = useMemo(() => buildPipelineNodes(jobs), [jobs])
  const preferredNode =
    nodes.find((node) => node.status === 'in_progress') ??
    nodes.find((node) => node.status === 'failure') ??
    nodes[0]
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? preferredNode

  if (!run) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          데이터 없음
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          파이프라인을 표시할 workflow run이 없습니다.
        </h2>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin text-slate-400"
        />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          실제 job/step 기반 파이프라인을 조회하고 있습니다.
        </h2>
      </section>
    )
  }

  if (nodes.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          데이터 없음
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          파이프라인 단계 데이터를 확인할 수 없습니다.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          GitHub Actions API가 반환한 jobs 또는 steps가 있을 때만
          PipelineVisualizer를 표시합니다.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pipeline Visualizer
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {run.name ?? 'Unnamed workflow'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {run.head_branch ?? 'unknown branch'} · {getShortSha(run.head_sha)}
          </p>
        </div>
        <a
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 hover:underline"
          href={run.html_url}
          rel="noreferrer"
          target="_blank"
        >
          Open run
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <ol className="flex flex-col gap-4 lg:min-w-max lg:flex-row lg:items-stretch lg:gap-0">
          {nodes.map((node, index) => (
            <li
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
              key={node.id}
            >
              <PipelineNodeCard
                isSelected={selectedNode?.id === node.id}
                node={node}
                onSelect={() => setSelectedNodeId(node.id)}
              />
              {index < nodes.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={`mx-6 h-8 w-1 self-center rounded-full lg:mx-3 lg:h-1 lg:w-10 ${getConnectorStyles(
                    node.status,
                  )}`}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {selectedNode ? (
        <div className="mt-6">
          <PipelineNodeDetail node={selectedNode} />
        </div>
      ) : null}
    </section>
  )
}

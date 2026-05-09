import { ExternalLink, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkflowJob, WorkflowRun } from '../model/githubActions.types'
import type { PipelineNode } from '../model/pipeline.types'
import { getShortSha } from '../utils/githubActionsUtils'
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
  const stageGridTemplateColumns = `repeat(${stages.length.toString()}, minmax(180px, 1fr))`

  if (!run) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          데이터 없음
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          파이프라인 그래프를 표시할 workflow run이 없습니다.
        </h2>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin text-slate-400"
        />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          실제 jobs/steps 기반 dependency graph를 조회하고 있습니다.
        </h2>
      </section>
    )
  }

  if (stages.length === 0) {
    return (
      <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          데이터 없음
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          파이프라인 stage 데이터를 확인할 수 없습니다.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          GitHub Actions API가 반환한 실제 jobs 또는 steps가 있을 때만 stage
          graph를 표시합니다.
        </p>
      </section>
    )
  }

  return (
    <section className="flowship-rise flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pipeline Dependency Graph
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {run.name ?? 'Unnamed workflow'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {run.head_branch ?? 'unknown branch'} ·{' '}
              {getShortSha(run.head_sha)}
            </p>
          </div>
          <div className="flex min-w-[220px] flex-col gap-2 sm:items-end">
            <p className="text-sm font-semibold text-slate-700">
              {progress.toString()}% stage progress
            </p>
            <div className="h-2 w-full rounded-full bg-slate-100 sm:w-56">
              <div
                className="flowship-flow-line h-2 rounded-full bg-gradient-to-r from-slate-950 via-slate-500 to-slate-950 transition-all"
                style={{ width: `${progress.toString()}%` }}
              />
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
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 pb-2">
        <div
          className="grid h-full min-h-0 gap-2"
          style={{ gridTemplateColumns: stageGridTemplateColumns }}
        >
          {stages.map((stage, index) => (
            <PipelineStageColumn
              isLast={index === stages.length - 1}
              key={stage.id}
              onSelectNode={setSelectedNode}
              selectedNodeId={activeNode?.id ?? null}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

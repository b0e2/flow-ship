import {
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDotDashed,
  ExternalLink,
  Loader2,
  XCircle,
} from 'lucide-react'
import type { WorkflowJob, WorkflowRun } from '../model/githubActions.types'
import type { PipelineNode, PipelineNodeStatus } from '../model/pipeline.types'
import { formatDuration, getShortSha } from '../utils/githubActionsUtils'
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

function PipelineNodeCard({ node }: { node: PipelineNode }) {
  return (
    <article
      className={`min-w-[220px] rounded-2xl border p-4 shadow-sm ${getNodeStyles(
        node.status,
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusIcon status={node.status} />
        <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold uppercase">
          {node.source}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-6">{node.name}</h3>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold opacity-80">
        <span>{node.status}</span>
        <span>{formatDuration(node.durationInSeconds)}</span>
      </div>
      {node.htmlUrl ? (
        <a
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          href={node.htmlUrl}
          rel="noreferrer"
          target="_blank"
        >
          GitHub detail
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      ) : null}
    </article>
  )
}

export function PipelineVisualizer({
  run,
  jobs,
  isLoading,
}: PipelineVisualizerProps) {
  const nodes = buildPipelineNodes(jobs)

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
        <div className="flex flex-col gap-3 lg:min-w-max lg:flex-row lg:items-stretch">
          {nodes.map((node) => (
            <PipelineNodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </section>
  )
}

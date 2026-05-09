import {
  CheckCircle2,
  Circle,
  CircleDashed,
  Loader2,
  XCircle,
} from 'lucide-react'
import type { PipelineNode, PipelineNodeStatus } from '../model/pipeline.types'
import { formatDuration } from '../utils/githubActionsUtils'

type PipelineNodeCardProps = {
  node: PipelineNode
  isSelected: boolean
  onSelect: () => void
}

function getNodeClassName(status: PipelineNodeStatus) {
  if (status === 'success') {
    return 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
  }

  if (status === 'failure') {
    return 'border-red-200 bg-red-50/90 text-red-900'
  }

  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50 text-blue-900 shadow-[0_0_28px_rgba(59,130,246,0.22)]'
  }

  if (status === 'queued') {
    return 'border-slate-200 bg-slate-50 text-slate-600'
  }

  if (status === 'skipped' || status === 'cancelled') {
    return 'border-slate-200 bg-slate-50 text-slate-400'
  }

  return 'border-slate-200 bg-white text-slate-800'
}

function StatusIcon({ status }: { status: PipelineNodeStatus }) {
  if (status === 'success') {
    return <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
  }

  if (status === 'failure') {
    return <XCircle aria-hidden="true" className="h-4 w-4" />
  }

  if (status === 'in_progress') {
    return <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
  }

  if (status === 'queued' || status === 'skipped') {
    return <CircleDashed aria-hidden="true" className="h-4 w-4" />
  }

  return <Circle aria-hidden="true" className="h-4 w-4" />
}

export function PipelineNodeCard({
  isSelected,
  node,
  onSelect,
}: PipelineNodeCardProps) {
  const isRunning = node.status === 'in_progress'

  return (
    <button
      className={`flowship-rise w-full rounded-2xl border px-2.5 py-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${getNodeClassName(
        node.status,
      )} ${isSelected ? 'ring-2 ring-slate-950 ring-offset-2' : ''} ${
        isRunning ? 'animate-pulse' : ''
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase">
          <StatusIcon status={node.status} />
          {node.status}
        </span>
        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          {node.source}
        </span>
      </div>
      <h4 className="mt-1.5 line-clamp-2 text-xs font-semibold leading-4">
        {node.name}
      </h4>
      <p className="mt-1 truncate text-[11px] font-medium opacity-75">
        {node.jobName}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold opacity-80">
        {formatDuration(node.durationSeconds)}
      </p>
    </button>
  )
}

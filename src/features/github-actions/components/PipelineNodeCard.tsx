import {
  CheckCircle2,
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

type NodeStyle = {
  card: string
  accent: string
  iconColor: string
  selectedRing: string
}

function getNodeStyle(status: PipelineNodeStatus, isSelected: boolean): NodeStyle {
  const ring = isSelected ? 'ring-1 ring-offset-1' : ''

  if (status === 'success') return {
    card: `bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 ${ring}`,
    accent: 'bg-emerald-400/50 dark:bg-emerald-600/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    selectedRing: isSelected ? 'ring-emerald-300 dark:ring-emerald-600' : '',
  }
  if (status === 'failure') return {
    card: `bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 ${ring}`,
    accent: 'bg-red-400/50 dark:bg-red-600/40',
    iconColor: 'text-red-500 dark:text-red-400',
    selectedRing: isSelected ? 'ring-red-300 dark:ring-red-600' : '',
  }
  if (status === 'in_progress') return {
    card: `bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 ${ring}`,
    accent: 'bg-sky-400/50 dark:bg-sky-600/40',
    iconColor: 'text-sky-500 dark:text-sky-400',
    selectedRing: isSelected ? 'ring-sky-300 dark:ring-sky-600' : '',
  }
  if (status === 'queued') return {
    card: `bg-white/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 ${ring}`,
    accent: 'bg-slate-300/50 dark:bg-slate-600/40',
    iconColor: 'text-slate-400 dark:text-slate-500',
    selectedRing: isSelected ? 'ring-slate-300 dark:ring-slate-600' : '',
  }
  return {
    card: `bg-white/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 text-slate-400 dark:text-slate-500 ${ring}`,
    accent: 'bg-slate-200/50 dark:bg-slate-700/30',
    iconColor: 'text-slate-300 dark:text-slate-600',
    selectedRing: '',
  }
}

function StatusIcon({ status }: { status: PipelineNodeStatus }) {
  if (status === 'success') return <CheckCircle2 className="h-3 w-3" />
  if (status === 'failure') return <XCircle className="h-3 w-3" />
  if (status === 'in_progress') return <Loader2 className="h-3 w-3 animate-spin" />
  return <CircleDashed className="h-3 w-3" />
}

export function PipelineNodeCard({ isSelected, node, onSelect }: PipelineNodeCardProps) {
  const style = getNodeStyle(node.status, isSelected)

  return (
    <button
      className={`relative w-full overflow-hidden rounded-xl border text-left shadow-sm transition duration-150 hover:-translate-y-px hover:shadow-md ${style.card} ${style.selectedRing}`}
      onClick={onSelect}
      type="button"
    >
      <div className={`absolute inset-y-0 left-0 w-0.5 ${style.accent}`} />
      <div className="py-2 pl-3 pr-2">
        <div className="flex items-center justify-between gap-1.5">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${style.iconColor}`}>
            <StatusIcon status={node.status} />
            {node.status === 'in_progress' ? 'running' : node.status}
          </span>
          <span className="rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
            {node.source}
          </span>
        </div>
        <h4 className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-4 text-slate-800 dark:text-slate-200">
          {node.name}
        </h4>
        <div className="mt-1.5 flex items-center justify-between gap-1">
          <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{node.jobName}</p>
          {node.durationSeconds != null && node.durationSeconds > 0 ? (
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
              {formatDuration(node.durationSeconds)}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

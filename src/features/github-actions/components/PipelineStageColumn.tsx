import type { PipelineNode, PipelineStage } from '../model/pipeline.types'
import { PipelineNodeCard } from './PipelineNodeCard'

type PipelineStageColumnProps = {
  stage: PipelineStage
  stageIndex: number
  isLast: boolean
  selectedNodeId: string | null
  onSelectNode: (node: PipelineNode) => void
}

type StageStatus = PipelineStage['status']

function getStageStyle(status: StageStatus) {
  // Muted borders and very subtle backgrounds — avoid fluorescent accents
  if (status === 'success') return {
    card: 'border-slate-200 dark:border-slate-700/60',
    bg: 'bg-white dark:bg-slate-800/50',
    accent: 'bg-emerald-400/60 dark:bg-emerald-600/50',
    num: 'text-emerald-600/70 dark:text-emerald-500/60',
    badge: 'bg-slate-100 text-emerald-700 dark:bg-slate-700/60 dark:text-emerald-400',
    divider: 'bg-emerald-300/40 dark:bg-emerald-700/30',
  }
  if (status === 'failure') return {
    card: 'border-slate-200 dark:border-slate-700/60',
    bg: 'bg-white dark:bg-slate-800/50',
    accent: 'bg-red-400/60 dark:bg-red-600/50',
    num: 'text-red-500/70 dark:text-red-400/60',
    badge: 'bg-slate-100 text-red-700 dark:bg-slate-700/60 dark:text-red-400',
    divider: 'bg-red-300/40 dark:bg-red-700/30',
  }
  if (status === 'in_progress') return {
    card: 'border-slate-200 dark:border-slate-700/60',
    bg: 'bg-white dark:bg-slate-800/50',
    accent: 'bg-sky-400/60 dark:bg-sky-600/50',
    num: 'text-sky-600/70 dark:text-sky-500/60',
    badge: 'bg-slate-100 text-sky-700 dark:bg-slate-700/60 dark:text-sky-400',
    divider: 'bg-sky-300/40 dark:bg-sky-700/30',
  }
  return {
    card: 'border-slate-200 dark:border-slate-700/60',
    bg: 'bg-white dark:bg-slate-800/50',
    accent: 'bg-slate-300/60 dark:bg-slate-600/50',
    num: 'text-slate-300 dark:text-slate-600',
    badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
    divider: 'bg-slate-200/60 dark:bg-slate-700/40',
  }
}

function getConnectorColor(status: StageStatus): string {
  // Muted connector colors
  if (status === 'success') return '#6ee7b7'   // emerald-300
  if (status === 'failure') return '#fca5a5'   // red-300
  if (status === 'in_progress') return '#7dd3fc' // sky-300
  return '#e2e8f0'                               // slate-200
}

function Connector({ status }: { status: StageStatus }) {
  const color = getConnectorColor(status)
  const dashed = status === 'unknown' || status === 'cancelled'
  return (
    <div className="flex shrink-0 items-center self-center" style={{ width: 48 }}>
      <svg fill="none" height="16" overflow="visible" viewBox="0 0 48 16" width="48">
        <line
          stroke={color}
          strokeDasharray={dashed ? '4 3' : undefined}
          strokeLinecap="round"
          strokeWidth="1.5"
          x1="0" x2="40" y1="8" y2="8"
        />
        <polyline
          fill="none"
          points="34,4 42,8 34,12"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}

export function PipelineStageColumn({
  isLast,
  onSelectNode,
  selectedNodeId,
  stage,
  stageIndex,
}: PipelineStageColumnProps) {
  const s = getStageStyle(stage.status)
  const stepNum = String(stageIndex + 1).padStart(2, '0')

  return (
    <div className="flex shrink-0 items-stretch gap-0">
      <section
        className={`relative flex w-[192px] flex-col overflow-hidden rounded-2xl border shadow-sm transition duration-200 hover:shadow-md dark:hover:shadow-black/20 ${s.card} ${s.bg}`}
      >
        {/* Left accent bar */}
        <div className={`absolute inset-y-0 left-0 w-[3px] ${s.accent}`} />

        <div className="pl-4 pr-3 pt-3 pb-3">
          {/* Stage header */}
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tabular-nums leading-none ${s.num}`}>
                {stepNum}
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Stage
                </p>
                <h3 className="text-[11px] font-bold leading-tight text-slate-800 dark:text-slate-200">
                  {stage.name}
                </h3>
              </div>
            </div>
            <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${s.badge}`}>
              {stage.status === 'in_progress' ? 'running' : stage.status}
            </span>
          </div>

          {/* Subtle divider */}
          <div className={`mb-2.5 h-px w-full ${s.divider}`} />

          {/* Nodes */}
          <div className="flex flex-col gap-1.5">
            {stage.nodes.map((node) => (
              <PipelineNodeCard
                isSelected={selectedNodeId === node.id}
                key={node.id}
                node={node}
                onSelect={() => onSelectNode(node)}
              />
            ))}
          </div>
        </div>
      </section>

      {!isLast ? <Connector status={stage.status} /> : null}
    </div>
  )
}

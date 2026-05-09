import { ArrowRight } from 'lucide-react'
import type { PipelineNode, PipelineStage } from '../model/pipeline.types'
import { PipelineNodeCard } from './PipelineNodeCard'

type PipelineStageColumnProps = {
  stage: PipelineStage
  isLast: boolean
  selectedNodeId: string | null
  onSelectNode: (node: PipelineNode) => void
}

function getStageClassName(status: PipelineStage['status']) {
  if (status === 'success') {
    return 'border-emerald-200 bg-emerald-50/40'
  }

  if (status === 'failure') {
    return 'border-red-200 bg-red-50/40'
  }

  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50/40'
  }

  return 'border-slate-200 bg-slate-50/80'
}

export function PipelineStageColumn({
  isLast,
  onSelectNode,
  selectedNodeId,
  stage,
}: PipelineStageColumnProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      <section
        className={`flex min-w-[180px] max-w-[205px] flex-1 flex-col rounded-3xl border p-2.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm ${getStageClassName(
          stage.status,
        )}`}
      >
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Stage
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-slate-950">
              {stage.name}
            </h3>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {stage.status}
          </span>
        </div>

        <div className="space-y-1.5">
          {stage.nodes.map((node) => (
            <PipelineNodeCard
              isSelected={selectedNodeId === node.id}
              key={node.id}
              node={node}
              onSelect={() => onSelectNode(node)}
            />
          ))}
        </div>
      </section>

      {!isLast ? (
        <div
          aria-hidden="true"
          className="flex items-center justify-center text-slate-300"
        >
          <div className="flowship-flow-line hidden h-0.5 w-8 rounded-full bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 lg:block" />
          <ArrowRight className="hidden h-4 w-4 animate-pulse lg:block" />
          <div className="h-8 w-0.5 bg-slate-200 lg:hidden" />
        </div>
      ) : null}
    </div>
  )
}

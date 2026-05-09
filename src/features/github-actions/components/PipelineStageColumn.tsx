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
    return 'border-emerald-200 bg-emerald-50/50'
  }

  if (status === 'failure') {
    return 'border-red-200 bg-red-50/50'
  }

  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50/50'
  }

  return 'border-slate-200 bg-slate-50'
}

export function PipelineStageColumn({
  isLast,
  onSelectNode,
  selectedNodeId,
  stage,
}: PipelineStageColumnProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      <section
        className={`min-w-[260px] rounded-3xl border p-4 ${getStageClassName(
          stage.status,
        )}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stage
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">
              {stage.name}
            </h3>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
            {stage.status}
          </span>
        </div>

        <div className="space-y-3">
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
          <div className="hidden h-0.5 w-10 bg-slate-200 lg:block" />
          <ArrowRight className="hidden h-5 w-5 lg:block" />
          <div className="h-8 w-0.5 bg-slate-200 lg:hidden" />
        </div>
      ) : null}
    </div>
  )
}

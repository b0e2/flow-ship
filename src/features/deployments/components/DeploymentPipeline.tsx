import { CheckCircle2, CircleDashed, LoaderCircle, XCircle } from 'lucide-react'
import type {
  PipelineStep,
  PipelineStepStatus,
} from '../model/deployment.types'
import { formatDuration } from '../utils/deploymentUtils'

type DeploymentPipelineProps = {
  steps: PipelineStep[]
}

const stepStyles: Record<PipelineStepStatus, string> = {
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  running: 'border-amber-200 bg-amber-50 text-amber-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  skipped: 'border-slate-200 bg-slate-50 text-slate-500',
}

const stepIcons = {
  completed: CheckCircle2,
  running: LoaderCircle,
  failed: XCircle,
  skipped: CircleDashed,
} satisfies Record<PipelineStepStatus, typeof CheckCircle2>

export function DeploymentPipeline({ steps }: DeploymentPipelineProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          GitHub Actions pipeline
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Code Push to Deploy step status.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {steps.map((step) => {
          const Icon = stepIcons[step.status]

          return (
            <div
              className={`rounded-2xl border p-4 ${stepStyles[step.status]}`}
              key={step.id}
            >
              <Icon
                aria-hidden="true"
                className={step.status === 'running' ? 'animate-spin' : ''}
                size={20}
              />
              <p className="mt-3 text-sm font-semibold">{step.name}</p>
              <p className="mt-1 text-xs opacity-80">
                {step.status} · {formatDuration(step.durationSeconds)}
              </p>
            </div>
          )
        })}
      </div>
    </article>
  )
}

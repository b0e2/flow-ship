import { Activity, CircleCheck, CircleX, Timer } from 'lucide-react'
import type { WorkflowRun } from '../model/githubActions.types'
import {
  findLatestRun,
  formatDuration,
  formatWorkflowStatus,
  getAverageDuration,
  getFailureCount,
  getSuccessRate,
} from '../utils/githubActionsUtils'

type WorkflowMetricsProps = {
  runs: WorkflowRun[]
  compact?: boolean
}

type MetricCardProps = {
  label: string
  value: string
  icon: typeof Activity
  compact?: boolean
}

function MetricCard({
  compact = false,
  label,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon aria-hidden="true" className="h-5 w-5 text-slate-400" />
      </div>
      <p
        className={`mt-3 font-semibold tracking-tight text-slate-950 ${
          compact ? 'text-2xl' : 'text-3xl'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function WorkflowMetrics({
  compact = false,
  runs,
}: WorkflowMetricsProps) {
  const latestRun = findLatestRun(runs)
  const latestStatus = latestRun
    ? formatWorkflowStatus(latestRun.status, latestRun.conclusion)
    : '데이터 없음'

  return (
    <section
      className={`grid gap-4 ${
        compact ? 'md:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-4'
      }`}
    >
      <MetricCard
        compact={compact}
        icon={CircleCheck}
        label="Success rate"
        value={`${getSuccessRate(runs).toString()}%`}
      />
      <MetricCard
        compact={compact}
        icon={CircleX}
        label="Failure count"
        value={getFailureCount(runs).toString()}
      />
      <MetricCard
        compact={compact}
        icon={Timer}
        label="Average duration"
        value={formatDuration(getAverageDuration(runs))}
      />
      <MetricCard
        compact={compact}
        icon={Activity}
        label="Latest run"
        value={latestStatus}
      />
    </section>
  )
}

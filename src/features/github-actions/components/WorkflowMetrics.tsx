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
}

type MetricCardProps = {
  label: string
  value: string
  icon: typeof Activity
}

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon aria-hidden="true" className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  )
}

export function WorkflowMetrics({ runs }: WorkflowMetricsProps) {
  const latestRun = findLatestRun(runs)
  const latestStatus = latestRun
    ? formatWorkflowStatus(latestRun.status, latestRun.conclusion)
    : '데이터 없음'

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={CircleCheck}
        label="Success rate"
        value={`${getSuccessRate(runs).toString()}%`}
      />
      <MetricCard
        icon={CircleX}
        label="Failure count"
        value={getFailureCount(runs).toString()}
      />
      <MetricCard
        icon={Timer}
        label="Average duration"
        value={formatDuration(getAverageDuration(runs))}
      />
      <MetricCard icon={Activity} label="Latest run" value={latestStatus} />
    </section>
  )
}

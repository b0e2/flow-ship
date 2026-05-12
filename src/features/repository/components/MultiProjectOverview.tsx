import type { RepositoryLatestRunState } from '../../github-actions/hooks/useRepositoryLatestRuns'

type MultiProjectOverviewProps = {
  items: RepositoryLatestRunState[]
  compact?: boolean
}

function getCounts(items: RepositoryLatestRunState[]) {
  return items.reduce(
    (counts, item) => {
      if (item.latestRun?.status === 'queued') {
        return { ...counts, queued: counts.queued + 1 }
      }

      if (item.latestRun?.status === 'in_progress') {
        return { ...counts, running: counts.running + 1 }
      }

      if (item.latestRun?.conclusion === 'success') {
        return { ...counts, healthy: counts.healthy + 1 }
      }

      if (
        item.latestRun?.conclusion === 'failure' ||
        item.latestRun?.conclusion === 'timed_out'
      ) {
        return { ...counts, failed: counts.failed + 1 }
      }

      return { ...counts, unknown: counts.unknown + 1 }
    },
    {
      healthy: 0,
      failed: 0,
      running: 0,
      queued: 0,
      unknown: 0,
    },
  )
}

type StatCardVariant = 'default' | 'danger' | 'success' | 'info'

function getStatCardClass(variant: StatCardVariant, compact: boolean) {
  const pad = compact ? 'p-3' : 'p-4'
  if (variant === 'danger') {
    return `${pad} rounded-2xl border border-red-200 bg-red-50 shadow-sm dark:border-red-800/60 dark:bg-red-950/40`
  }
  if (variant === 'success') {
    return `${pad} rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40`
  }
  if (variant === 'info') {
    return `${pad} rounded-2xl border border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800/60 dark:bg-blue-950/40`
  }
  return `${pad} rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900`
}

function getStatLabelClass(variant: StatCardVariant) {
  if (variant === 'danger') return 'text-red-500 dark:text-red-400'
  if (variant === 'success') return 'text-emerald-600 dark:text-emerald-400'
  if (variant === 'info') return 'text-blue-600 dark:text-blue-400'
  return 'text-slate-500 dark:text-slate-400'
}

function getStatValueClass(variant: StatCardVariant, compact: boolean) {
  const size = compact ? 'text-xl' : 'text-2xl'
  if (variant === 'danger') return `${size} font-bold tracking-tight text-red-800 dark:text-red-300`
  if (variant === 'success') return `${size} font-bold tracking-tight text-emerald-800 dark:text-emerald-300`
  if (variant === 'info') return `${size} font-bold tracking-tight text-blue-800 dark:text-blue-300`
  return `${size} font-semibold tracking-tight text-slate-950 dark:text-white`
}

function StatCard({
  compact = false,
  label,
  value,
  variant = 'default',
}: {
  compact?: boolean
  label: string
  value: number | string
  variant?: StatCardVariant
}) {
  return (
    <div className={getStatCardClass(variant, compact)}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${getStatLabelClass(variant)}`}>
        {label}
      </p>
      <p className={`mt-2 ${getStatValueClass(variant, compact)}`}>
        {value}
      </p>
    </div>
  )
}

export function MultiProjectOverview({
  compact = false,
  items,
}: MultiProjectOverviewProps) {
  const counts = getCounts(items)
  const completedLatestRuns = items.filter(
    (item) => item.latestRun?.status === 'completed',
  )
  const successRate =
    completedLatestRuns.length > 0
      ? Math.round((counts.healthy / completedLatestRuns.length) * 100)
      : 0

  if (compact) {
    return (
      <section className="grid grid-cols-2 gap-2">
        <StatCard compact label="Total" value={items.length} />
        <StatCard
          compact
          label="Failed"
          value={counts.failed}
          variant={counts.failed > 0 ? 'danger' : 'default'}
        />
        <StatCard
          compact
          label="Running"
          value={counts.running}
          variant={counts.running > 0 ? 'info' : 'default'}
        />
        <StatCard
          compact
          label="Success"
          value={`${successRate}%`}
          variant={successRate >= 80 ? 'success' : 'default'}
        />
      </section>
    )
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <StatCard label="Total" value={items.length} />
      <StatCard
        label="Healthy"
        value={counts.healthy}
        variant={counts.healthy > 0 ? 'success' : 'default'}
      />
      <StatCard
        label="Failed"
        value={counts.failed}
        variant={counts.failed > 0 ? 'danger' : 'default'}
      />
      <StatCard
        label="Running"
        value={counts.running}
        variant={counts.running > 0 ? 'info' : 'default'}
      />
      <StatCard label="Unknown" value={counts.unknown + counts.queued} />
      <StatCard
        label="Success"
        value={`${successRate}%`}
        variant={successRate >= 80 ? 'success' : 'default'}
      />
    </section>
  )
}

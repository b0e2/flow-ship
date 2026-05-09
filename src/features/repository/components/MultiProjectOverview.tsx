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

function StatCard({
  compact = false,
  label,
  value,
}: {
  compact?: boolean
  label: string
  value: number | string
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold tracking-tight text-slate-950 ${
          compact ? 'text-xl' : 'text-2xl'
        }`}
      >
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

  return (
    <section
      className={`grid gap-3 ${
        compact ? 'grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-6'
      }`}
    >
      <StatCard compact={compact} label="Total" value={items.length} />
      <StatCard compact={compact} label="Healthy" value={counts.healthy} />
      <StatCard compact={compact} label="Failed" value={counts.failed} />
      <StatCard compact={compact} label="Running" value={counts.running} />
      <StatCard
        compact={compact}
        label="Unknown"
        value={counts.unknown + counts.queued}
      />
      <StatCard compact={compact} label="Success" value={`${successRate}%`} />
    </section>
  )
}

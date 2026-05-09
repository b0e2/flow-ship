import { AlertCircle, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'
import type { RepositoryLatestRunState } from '../../github-actions/hooks/useRepositoryLatestRuns'
import { formatWorkflowStatus } from '../../github-actions/utils/githubActionsUtils'

type RepositoryListProps = {
  items: RepositoryLatestRunState[]
  activeRepositoryId: string | null
  onSelectRepository: (id: string) => void
}

function getProjectStatus(item: RepositoryLatestRunState) {
  if (item.isLoading) {
    return 'loading'
  }

  if (item.isError || !item.latestRun) {
    return 'unknown'
  }

  if (item.latestRun.status === 'queued') {
    return 'queued'
  }

  if (item.latestRun.status === 'in_progress') {
    return 'running'
  }

  if (item.latestRun.conclusion === 'success') {
    return 'success'
  }

  if (
    item.latestRun.conclusion === 'failure' ||
    item.latestRun.conclusion === 'timed_out'
  ) {
    return 'failure'
  }

  return 'unknown'
}

function StatusBadge({ item }: { item: RepositoryLatestRunState }) {
  const status = getProjectStatus(item)

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        loading
      </span>
    )
  }

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
        success
      </span>
    )
  }

  if (status === 'failure') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
        failure
      </span>
    )
  }

  if (status === 'running' || status === 'queued') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        {status}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <CircleDashed aria-hidden="true" className="h-3.5 w-3.5" />
      unknown
    </span>
  )
}

export function RepositoryList({
  activeRepositoryId,
  items,
  onSelectRepository,
}: RepositoryListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Projects
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          Deployment control center
        </h2>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const isActive = item.repository.id === activeRepositoryId
          const latestStatus = item.latestRun
            ? formatWorkflowStatus(
                item.latestRun.status,
                item.latestRun.conclusion,
              )
            : '데이터 없음'

          return (
            <button
              className={`w-full rounded-2xl border p-4 text-left transition hover:border-slate-400 ${
                isActive
                  ? 'border-slate-950 bg-slate-50 shadow-sm'
                  : 'border-slate-200 bg-white'
              }`}
              key={item.repository.id}
              onClick={() => onSelectRepository(item.repository.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {item.repository.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {item.repository.owner}/{item.repository.repo} ·{' '}
                    {item.repository.branch}
                  </p>
                </div>
                <StatusBadge item={item} />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Latest: {latestStatus}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

import { AlertCircle, CheckCircle2, CircleDashed, Loader2, Trash2 } from 'lucide-react'
import type { RepositoryLatestRunState } from '../../github-actions/hooks/useRepositoryLatestRuns'
import { formatWorkflowStatus } from '../../github-actions/utils/githubActionsUtils'

type RepositoryListProps = {
  items: RepositoryLatestRunState[]
  activeRepositoryId: string | null
  onSelectRepository: (id: string) => void
  onRemoveRepository?: (id: string) => void
}

function getProjectStatus(item: RepositoryLatestRunState) {
  if (item.isLoading) return 'loading'
  if (item.isError || !item.latestRun) return 'unknown'
  if (item.latestRun.status === 'queued') return 'queued'
  if (item.latestRun.status === 'in_progress') return 'running'
  if (item.latestRun.conclusion === 'success') return 'success'
  if (
    item.latestRun.conclusion === 'failure' ||
    item.latestRun.conclusion === 'timed_out'
  ) return 'failure'
  return 'unknown'
}

function StatusBadge({ item }: { item: RepositoryLatestRunState }) {
  const status = getProjectStatus(item)

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        loading
      </span>
    )
  }

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
        success
      </span>
    )
  }

  if (status === 'failure') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
        <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
        failure
      </span>
    )
  }

  if (status === 'running' || status === 'queued') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400" />
        {status}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-400">
      <CircleDashed aria-hidden="true" className="h-3.5 w-3.5" />
      unknown
    </span>
  )
}

export function RepositoryList({
  activeRepositoryId,
  items,
  onRemoveRepository,
  onSelectRepository,
}: RepositoryListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Projects
      </p>

      <div className="mt-3 space-y-1.5">
        {items.map((item) => {
          const isActive = item.repository.id === activeRepositoryId
          const latestStatus = item.latestRun
            ? formatWorkflowStatus(
                item.latestRun.status,
                item.latestRun.conclusion,
              )
            : '데이터 없음'

          return (
            <div
              className={`group relative rounded-2xl border transition hover:border-slate-400 dark:hover:border-slate-500 ${
                isActive
                  ? 'border-slate-950 bg-slate-950 shadow-sm dark:border-white/20 dark:bg-white/10'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
              }`}
              key={item.repository.id}
            >
              <button
                className="w-full p-3 text-left"
                onClick={() => onSelectRepository(item.repository.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-950 dark:text-slate-100'}`}>
                      {item.repository.name}
                    </p>
                    <p className={`mt-0.5 truncate text-xs font-medium ${isActive ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.repository.owner}/{item.repository.repo} · {item.repository.branch}
                    </p>
                  </div>
                  <StatusBadge item={item} />
                </div>
                <p className={`mt-2 text-xs font-medium ${isActive ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {latestStatus}
                </p>
              </button>

              {onRemoveRepository ? (
                <button
                  aria-label={`${item.repository.name} 삭제`}
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveRepository(item.repository.id)
                  }}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

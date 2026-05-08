import type { FailureLog, FailureSeverity } from '../model/deployment.types'

type FailureLogsProps = {
  failureLogs: FailureLog[]
}

const severityStyles: Record<FailureSeverity, string> = {
  low: 'bg-slate-100 text-slate-700 ring-slate-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function FailureLogs({ failureLogs }: FailureLogsProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Failure logs</h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent deployment blockers from build and hosting workflows.
        </p>
      </div>

      <div className="space-y-3">
        {failureLogs.map((log) => (
          <div className="rounded-2xl border border-slate-200 p-4" key={log.id}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-700">
                {log.errorCode}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${severityStyles[log.severity]}`}
              >
                {log.severity}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-950">
              {log.message}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{log.cause}</p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              {formatDate(log.occurredAt)}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

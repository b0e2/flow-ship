import { ExternalLink, GitBranch, Timer } from 'lucide-react'
import type { WorkflowRun } from '../model/githubActions.types'
import {
  formatDateTime,
  formatDuration,
  formatWorkflowStatus,
  getRunDuration,
  getShortSha,
} from '../utils/githubActionsUtils'

type WorkflowRunSummaryProps = {
  run: WorkflowRun
}

export function WorkflowRunSummary({ run }: WorkflowRunSummaryProps) {
  const statusLabel = formatWorkflowStatus(run.status, run.conclusion)
  const branch = run.head_branch ?? 'unknown branch'

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Latest workflow run
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {run.name ?? 'Unnamed workflow'}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {statusLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              <GitBranch aria-hidden="true" className="h-4 w-4" />
              {branch}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-mono text-slate-700">
              {getShortSha(run.head_sha)}
            </span>
          </div>
        </div>

        <a
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          href={run.html_url}
          rel="noreferrer"
          target="_blank"
        >
          Open in GitHub
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">Actor</p>
          <a
            className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline"
            href={run.actor.html_url}
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt=""
              className="h-6 w-6 rounded-full"
              src={run.actor.avatar_url}
            />
            {run.actor.login}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Duration</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
            <Timer aria-hidden="true" className="h-4 w-4 text-slate-400" />
            {formatDuration(getRunDuration(run))}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Started at</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {formatDateTime(run.run_started_at ?? run.created_at)}
          </p>
        </div>
      </div>
    </section>
  )
}

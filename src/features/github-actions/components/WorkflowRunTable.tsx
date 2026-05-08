import { ExternalLink } from 'lucide-react'
import type { WorkflowRun } from '../model/githubActions.types'
import {
  formatDateTime,
  formatDuration,
  formatWorkflowStatus,
  getRunDuration,
  getShortSha,
} from '../utils/githubActionsUtils'

type WorkflowRunTableProps = {
  runs: WorkflowRun[]
  selectedRunId: number | null
  onSelectRun: (runId: number) => void
}

export function WorkflowRunTable({
  runs,
  selectedRunId,
  onSelectRun,
}: WorkflowRunTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Recent workflow runs
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          GitHub Actions API에서 조회한 최근 workflow runs입니다.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Workflow</th>
              <th className="px-4 py-3 font-semibold">Branch</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Commit</th>
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Started</th>
              <th className="px-6 py-3 font-semibold">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((run) => (
              <tr
                className={`cursor-pointer align-middle transition hover:bg-slate-50 ${
                  selectedRunId === run.id ? 'bg-slate-100' : ''
                }`}
                key={run.id}
                onClick={() => onSelectRun(run.id)}
              >
                <td className="px-6 py-4 font-semibold text-slate-950">
                  {run.name ?? 'Unnamed workflow'}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {run.head_branch ?? 'unknown'}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {formatWorkflowStatus(run.status, run.conclusion)}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-slate-700">
                  {getShortSha(run.head_sha)}
                </td>
                <td className="px-4 py-4">
                  <a
                    className="flex items-center gap-2 font-medium text-slate-800 hover:underline"
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
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {formatDuration(getRunDuration(run))}
                </td>
                <td className="px-4 py-4 text-slate-700">
                  {formatDateTime(run.run_started_at ?? run.created_at)}
                </td>
                <td
                  className="px-6 py-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <a
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-950 hover:underline"
                    href={run.html_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    GitHub
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

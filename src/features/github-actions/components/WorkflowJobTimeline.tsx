import { ExternalLink, Loader2 } from 'lucide-react'
import type { WorkflowJob } from '../model/githubActions.types'
import {
  formatDateTime,
  formatDuration,
  formatWorkflowStatus,
  getDurationBetween,
  isFailedConclusion,
} from '../utils/githubActionsUtils'

type WorkflowJobTimelineProps = {
  jobs: WorkflowJob[]
  isLoading: boolean
}

function getStepClassName(conclusion: string | null) {
  if (isFailedConclusion(conclusion)) {
    return 'border-red-200 bg-red-50 text-red-900'
  }

  if (conclusion === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  }

  if (conclusion === 'skipped') {
    return 'border-slate-200 bg-slate-50 text-slate-500'
  }

  return 'border-slate-200 bg-white text-slate-800'
}

export function WorkflowJobTimeline({
  jobs,
  isLoading,
}: WorkflowJobTimelineProps) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Loader2
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin text-slate-400"
        />
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          선택된 run의 jobs와 steps를 조회하고 있습니다.
        </h2>
      </section>
    )
  }

  if (jobs.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          데이터 없음
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
          선택된 run에 표시할 job 데이터가 없습니다.
        </h2>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Workflow jobs and steps
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          선택된 workflow run에서 GitHub Actions API가 반환한 jobs와
          steps입니다.
        </p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <article
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            key={job.id}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {job.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                    {formatWorkflowStatus(job.status, job.conclusion)}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                    {formatDuration(
                      getDurationBetween(job.started_at, job.completed_at),
                    )}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                    {formatDateTime(job.started_at)}
                  </span>
                </div>
              </div>
              <a
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 hover:underline"
                href={job.html_url}
                rel="noreferrer"
                target="_blank"
              >
                Job detail
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>

            {job.steps.length > 0 ? (
              <ol className="mt-4 space-y-2">
                {job.steps.map((step) => (
                  <li
                    className={`rounded-xl border px-3 py-3 ${getStepClassName(
                      step.conclusion,
                    )}`}
                    key={`${job.id}-${step.number}`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {step.number.toString()}. {step.name}
                        </p>
                        <p className="mt-1 text-xs opacity-75">
                          {formatWorkflowStatus(step.status, step.conclusion)}
                        </p>
                      </div>
                      <p className="text-xs font-semibold opacity-75">
                        {formatDuration(
                          getDurationBetween(
                            step.started_at,
                            step.completed_at,
                          ),
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
                이 job에는 GitHub API가 반환한 step 데이터가 없습니다.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

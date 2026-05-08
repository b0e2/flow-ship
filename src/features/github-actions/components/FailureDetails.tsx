import { ExternalLink } from 'lucide-react'
import type { WorkflowJob } from '../model/githubActions.types'
import { isFailedConclusion } from '../utils/githubActionsUtils'

type FailureDetailsProps = {
  jobs: WorkflowJob[]
}

export function FailureDetails({ jobs }: FailureDetailsProps) {
  const failedItems = jobs.flatMap((job) => {
    const failedSteps = job.steps.filter((step) =>
      isFailedConclusion(step.conclusion),
    )

    if (failedSteps.length > 0) {
      return failedSteps.map((step) => ({
        jobId: job.id,
        jobName: job.name,
        stepName: step.name,
        conclusion: step.conclusion ?? 'failure',
        url: job.html_url,
      }))
    }

    if (isFailedConclusion(job.conclusion)) {
      return [
        {
          jobId: job.id,
          jobName: job.name,
          stepName: '데이터 없음',
          conclusion: job.conclusion ?? 'failure',
          url: job.html_url,
        },
      ]
    }

    return []
  })

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        Failure details
      </h2>

      {failedItems.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
          실패한 job/step이 없습니다.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {failedItems.map((item) => (
            <article
              className="rounded-2xl border border-red-200 bg-red-50 p-4"
              key={`${item.jobId}-${item.stepName}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {item.conclusion}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-red-950">
                    {item.jobName}
                  </h3>
                  <p className="mt-1 text-sm text-red-800">
                    Failed step: {item.stepName}
                  </p>
                </div>
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-900 hover:underline"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub Actions detail
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

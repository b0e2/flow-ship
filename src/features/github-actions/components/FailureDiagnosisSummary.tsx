import { ExternalLink, ShieldAlert } from 'lucide-react'
import type { WorkflowJob } from '../model/githubActions.types'
import {
  diagnoseFailureFromJobs,
  getPrimaryDiagnosis,
} from '../utils/failureDiagnosisUtils'

type FailureDiagnosisSummaryProps = {
  jobs: WorkflowJob[]
  isLoading: boolean
  onOpenDetails: () => void
}

export function FailureDiagnosisSummary({
  isLoading,
  jobs,
  onOpenDetails,
}: FailureDiagnosisSummaryProps) {
  const diagnoses = diagnoseFailureFromJobs(jobs)
  const primaryDiagnosis = getPrimaryDiagnosis(diagnoses)

  if (isLoading) {
    return (
      <section className="flowship-rise rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Failure diagnosis
        </p>
        <p className="mt-2 text-sm font-medium text-slate-600">
          실패 진단에 사용할 jobs/steps 데이터를 조회하고 있습니다.
        </p>
      </section>
    )
  }

  if (!primaryDiagnosis) {
    return (
      <section className="flowship-rise rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Failure diagnosis
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-emerald-950">
          No failure detected
        </h2>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          선택한 run에서 실패한 job/step을 찾지 못했습니다.
        </p>
      </section>
    )
  }

  return (
    <section className="flowship-rise rounded-3xl border border-red-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Latest failure
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-6 tracking-tight text-red-950">
            {primaryDiagnosis.title}
          </h2>
        </div>
        <span className="rounded-full bg-red-50 p-2 text-red-600">
          <ShieldAlert aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>

      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
            Failed point
          </dt>
          <dd className="mt-1 text-sm font-semibold leading-5 text-red-950">
            {primaryDiagnosis.detectedFrom}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
            Likely cause
          </dt>
          <dd className="mt-1 line-clamp-3 text-sm leading-5 text-red-900">
            {primaryDiagnosis.likelyCause}
          </dd>
        </div>
      </dl>

      <div className="mt-3 rounded-2xl bg-red-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
          Next action
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-red-950">
          {primaryDiagnosis.recommendedActions[0] ??
            'Open GitHub Actions detail and inspect the failed job logs.'}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl bg-red-950 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-900 hover:shadow-md"
          onClick={onOpenDetails}
          type="button"
        >
          Full diagnosis
        </button>
        {primaryDiagnosis.githubUrl ? (
          <a
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-950 hover:underline"
            href={primaryDiagnosis.githubUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open failed job
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </section>
  )
}

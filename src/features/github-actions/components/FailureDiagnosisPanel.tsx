import { ExternalLink, Loader2, ShieldAlert } from 'lucide-react'
import type { WorkflowJob } from '../model/githubActions.types'
import type { FailureDiagnosis } from '../model/diagnosis.types'
import {
  diagnoseFailureFromJobs,
  getPrimaryDiagnosis,
} from '../utils/failureDiagnosisUtils'

type FailureDiagnosisPanelProps = {
  jobs: WorkflowJob[]
  isLoading: boolean
}

function getSeverityClassName(severity: FailureDiagnosis['severity']) {
  if (severity === 'high') {
    return 'bg-red-50 text-red-700'
  }

  if (severity === 'medium') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function DiagnosisCard({
  diagnosis,
  isPrimary,
}: {
  diagnosis: FailureDiagnosis
  isPrimary: boolean
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        isPrimary ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {isPrimary ? 'Primary diagnosis' : 'Additional finding'}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            {diagnosis.title}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getSeverityClassName(
            diagnosis.severity,
          )}`}
        >
          {diagnosis.severity}
        </span>
      </div>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Detected from
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">
            {diagnosis.detectedFrom}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Likely cause
          </dt>
          <dd className="mt-1 text-sm leading-6 text-slate-700">
            {diagnosis.likelyCause}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommended actions
        </p>
        <ul className="mt-2 space-y-2">
          {diagnosis.recommendedActions.map((action) => (
            <li
              className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
              key={action}
            >
              {action}
            </li>
          ))}
        </ul>
      </div>

      {diagnosis.githubUrl ? (
        <a
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 hover:underline"
          href={diagnosis.githubUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open failed job
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      ) : null}
    </article>
  )
}

export function FailureDiagnosisPanel({
  isLoading,
  jobs,
}: FailureDiagnosisPanelProps) {
  const diagnoses = diagnoseFailureFromJobs(jobs)
  const primaryDiagnosis = getPrimaryDiagnosis(diagnoses)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Failure diagnosis
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Root-cause guide
          </h2>
        </div>
        <ShieldAlert aria-hidden="true" className="h-6 w-6 text-slate-400" />
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
          <Loader2
            aria-hidden="true"
            className="mr-2 inline h-4 w-4 animate-spin"
          />
          실패 진단에 사용할 jobs/steps 데이터를 조회하고 있습니다.
        </div>
      ) : diagnoses.length === 0 || !primaryDiagnosis ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
          No failure detected in the selected run.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <DiagnosisCard diagnosis={primaryDiagnosis} isPrimary />
          {diagnoses
            .filter((diagnosis) => diagnosis.id !== primaryDiagnosis.id)
            .map((diagnosis) => (
              <DiagnosisCard
                diagnosis={diagnosis}
                isPrimary={false}
                key={diagnosis.id}
              />
            ))}
        </div>
      )}
    </section>
  )
}

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Clock,
  ExternalLink,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { WorkflowJob, WorkflowJobStep } from '../model/githubActions.types'
import {
  formatDateTime,
  formatDuration,
  getDurationBetween,
  isFailedConclusion,
} from '../utils/githubActionsUtils'

type WorkflowJobTimelineProps = {
  jobs: WorkflowJob[]
  isLoading: boolean
}

// ─── helpers ────────────────────────────────────────────────────────────────

function conclusionStyle(conclusion: string | null) {
  if (conclusion === 'success')  return { dot: 'bg-emerald-400', badge: 'bg-slate-100 text-emerald-700 dark:bg-slate-700/60 dark:text-emerald-400', icon: 'text-emerald-500 dark:text-emerald-400' }
  if (isFailedConclusion(conclusion)) return { dot: 'bg-red-400',     badge: 'bg-slate-100 text-red-700 dark:bg-slate-700/60 dark:text-red-400',     icon: 'text-red-500 dark:text-red-400'     }
  if (conclusion === 'skipped')  return { dot: 'bg-slate-300',  badge: 'bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500',   icon: 'text-slate-300 dark:text-slate-600' }
  if (conclusion === null)       return { dot: 'bg-sky-400 animate-pulse', badge: 'bg-slate-100 text-sky-700 dark:bg-slate-700/60 dark:text-sky-400', icon: 'text-sky-500 dark:text-sky-400' }
  return                                { dot: 'bg-slate-200',  badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',   icon: 'text-slate-400 dark:text-slate-500' }
}

function ConclusionIcon({ conclusion, className }: { conclusion: string | null; className?: string }) {
  const s = conclusionStyle(conclusion)
  const cls = `${s.icon} ${className ?? ''}`
  if (conclusion === 'success')        return <CheckCircle2 className={cls} />
  if (isFailedConclusion(conclusion))  return <XCircle className={cls} />
  if (conclusion === null)             return <Loader2 className={`${cls} animate-spin`} />
  return <CircleDashed className={cls} />
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  )
}

// ─── Step row ────────────────────────────────────────────────────────────────

function StepRow({
  step,
  isSelected,
  onSelect,
}: {
  step: WorkflowJobStep
  isSelected: boolean
  onSelect: () => void
}) {
  const s = conclusionStyle(step.conclusion)
  const duration = getDurationBetween(step.started_at, step.completed_at)

  return (
    <li>
      <button
        className={`w-full rounded-xl border px-3 py-2.5 text-left transition duration-150 hover:shadow-sm ${
          isSelected
            ? 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700/60'
            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600 dark:hover:bg-slate-800/60'
        }`}
        onClick={onSelect}
        type="button"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500">
              {step.number.toString().padStart(2, '0')}
            </span>
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
              {step.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {duration != null && duration > 0 ? (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <Clock className="h-3 w-3" />
                {formatDuration(duration)}
              </span>
            ) : null}
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${s.badge}`}>
              {step.conclusion ?? step.status}
            </span>
          </div>
        </div>
      </button>

      {/* Step detail — shown when selected */}
      {isSelected ? (
        <div className="mt-1 ml-8 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DetailRow label="Status" value={step.status} />
            <DetailRow label="Conclusion" value={step.conclusion ?? '—'} />
            <DetailRow label="Started" value={step.started_at ? formatDateTime(step.started_at) : '—'} />
            <DetailRow label="Completed" value={step.completed_at ? formatDateTime(step.completed_at) : '—'} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <DetailRow label="Duration" value={duration != null && duration > 0 ? formatDuration(duration) : '—'} />
            <DetailRow label="Step #" value={step.number.toString()} />
          </div>
        </div>
      ) : null}
    </li>
  )
}

// ─── Job card ────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: WorkflowJob }) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedStepKey, setSelectedStepKey] = useState<string | null>(null)
  const s = conclusionStyle(job.conclusion)
  const duration = getDurationBetween(job.started_at, job.completed_at)

  const toggleStep = (key: string) => {
    setSelectedStepKey((prev) => (prev === key ? null : key))
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      {/* Job header */}
      <button
        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
        onClick={() => setIsOpen((o) => !o)}
        type="button"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0">
            <ConclusionIcon conclusion={job.conclusion} className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {job.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className={`text-[11px] font-semibold ${s.icon}`}>
                {job.conclusion ?? job.status}
              </span>
              {duration != null && duration > 0 ? (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock className="h-3 w-3" />
                  {formatDuration(duration)}
                </span>
              ) : null}
              {job.started_at ? (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {formatDateTime(job.started_at)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <a
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
            href={job.html_url}
            rel="noreferrer"
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            Logs
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen ? (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          {/* Job detail metrics */}
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DetailRow label="Status" value={job.status} />
            <DetailRow label="Conclusion" value={job.conclusion ?? '—'} />
            <DetailRow label="Started" value={job.started_at ? formatDateTime(job.started_at) : '—'} />
            <DetailRow label="Completed" value={job.completed_at ? formatDateTime(job.completed_at) : '—'} />
          </div>

          {/* Steps list */}
          {job.steps.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Steps ({job.steps.length.toString()})
              </p>
              <ol className="space-y-1">
                {job.steps.map((step) => {
                  const key = `${job.id.toString()}-${step.number.toString()}`
                  return (
                    <StepRow
                      isSelected={selectedStepKey === key}
                      key={key}
                      onSelect={() => toggleStep(key)}
                      step={step}
                    />
                  )
                })}
              </ol>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
              이 job에 step 데이터가 없습니다.
            </p>
          )}
        </div>
      ) : null}
    </article>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkflowJobTimeline({ jobs, isLoading }: WorkflowJobTimelineProps) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <Loader2 aria-hidden="true" className="mx-auto h-7 w-7 animate-spin text-slate-400" />
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-700 dark:text-slate-300">
          Jobs & steps 로딩 중...
        </h2>
      </section>
    )
  }

  if (jobs.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700/60 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">No data</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-600 dark:text-slate-400">
          표시할 job 데이터가 없습니다.
        </h2>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Jobs & Steps
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          항목을 클릭하면 상세 정보를 볼 수 있습니다 · 로그는 GitHub에서 확인하세요
        </p>
      </div>

      <div className="space-y-2.5 p-4">
        {jobs.map((job) => (
          <JobCard job={job} key={job.id} />
        ))}
      </div>
    </section>
  )
}

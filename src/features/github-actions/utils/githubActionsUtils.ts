import type { WorkflowRun } from '../model/githubActions.types'

export function getShortSha(sha: string) {
  return sha.slice(0, 7)
}

export function getRunDuration(run: WorkflowRun) {
  if (!run.run_started_at) {
    return null
  }

  const startedAt = new Date(run.run_started_at).getTime()
  const updatedAt = new Date(run.updated_at).getTime()

  if (Number.isNaN(startedAt) || Number.isNaN(updatedAt)) {
    return null
  }

  return Math.max(0, Math.round((updatedAt - startedAt) / 1000))
}

export function getDurationBetween(
  startedAtValue: string | null,
  completedAtValue: string | null,
) {
  if (!startedAtValue || !completedAtValue) {
    return null
  }

  const startedAt = new Date(startedAtValue).getTime()
  const completedAt = new Date(completedAtValue).getTime()

  if (Number.isNaN(startedAt) || Number.isNaN(completedAt)) {
    return null
  }

  return Math.max(0, Math.round((completedAt - startedAt) / 1000))
}

export function formatDuration(durationInSeconds: number | null) {
  if (durationInSeconds === null) {
    return '데이터 없음'
  }

  if (durationInSeconds < 60) {
    return `${durationInSeconds.toString()}s`
  }

  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60

  if (minutes < 60) {
    return seconds > 0
      ? `${minutes.toString()}m ${seconds.toString()}s`
      : `${minutes.toString()}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0
    ? `${hours.toString()}h ${remainingMinutes.toString()}m`
    : `${hours.toString()}h`
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return '데이터 없음'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '데이터 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatWorkflowStatus(
  status: string,
  conclusion: string | null,
) {
  if (status === 'completed') {
    return conclusion ?? 'completed'
  }

  return status
}

export function isRunningWorkflowStatus(status: string) {
  return status === 'queued' || status === 'in_progress'
}

export function isFailedConclusion(conclusion: string | null) {
  return conclusion === 'failure' || conclusion === 'timed_out'
}

export function getSuccessRate(runs: WorkflowRun[]) {
  const completedRuns = runs.filter((run) => run.status === 'completed')

  if (completedRuns.length === 0) {
    return 0
  }

  const successCount = completedRuns.filter(
    (run) => run.conclusion === 'success',
  ).length

  return Math.round((successCount / completedRuns.length) * 100)
}

export function getFailureCount(runs: WorkflowRun[]) {
  return runs.filter((run) => isFailedConclusion(run.conclusion)).length
}

export function getAverageDuration(runs: WorkflowRun[]) {
  const durations = runs
    .map((run) => getRunDuration(run))
    .filter((duration): duration is number => duration !== null)

  if (durations.length === 0) {
    return 0
  }

  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0)

  return Math.round(totalDuration / durations.length)
}

export function findLatestRun(runs: WorkflowRun[]) {
  return runs.toSorted((left, right) => {
    return (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
  })[0]
}

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

export function formatWorkflowStatus(
  status: string,
  conclusion: string | null,
) {
  if (status === 'completed') {
    return conclusion ?? 'completed'
  }

  return status
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

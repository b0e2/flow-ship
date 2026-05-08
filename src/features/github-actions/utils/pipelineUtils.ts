import type { WorkflowJob } from '../model/githubActions.types'
import type { PipelineNode, PipelineNodeStatus } from '../model/pipeline.types'
import { getDurationBetween } from './githubActionsUtils'

function toPipelineStatus(
  status: string,
  conclusion: string | null,
): PipelineNodeStatus {
  if (status === 'queued') {
    return 'queued'
  }

  if (status === 'in_progress') {
    return 'in_progress'
  }

  if (status !== 'completed') {
    return 'unknown'
  }

  if (conclusion === 'success') {
    return 'success'
  }

  if (conclusion === 'failure' || conclusion === 'timed_out') {
    return 'failure'
  }

  if (conclusion === 'skipped') {
    return 'skipped'
  }

  if (conclusion === 'cancelled') {
    return 'cancelled'
  }

  return 'completed'
}

export function buildPipelineNodes(jobs: WorkflowJob[]): PipelineNode[] {
  const stepNodes = jobs.flatMap((job) =>
    job.steps.map((step) => ({
      id: `step-${job.id.toString()}-${step.number.toString()}`,
      name: step.name,
      status: toPipelineStatus(step.status, step.conclusion),
      source: 'step' as const,
      durationInSeconds: getDurationBetween(
        step.started_at,
        step.completed_at,
      ),
      startedAt: step.started_at,
      completedAt: step.completed_at,
      htmlUrl: job.html_url,
    })),
  )

  if (stepNodes.length > 0) {
    return stepNodes
  }

  return jobs.map((job) => ({
    id: `job-${job.id.toString()}`,
    name: job.name,
    status: toPipelineStatus(job.status, job.conclusion),
    source: 'job',
    durationInSeconds: getDurationBetween(job.started_at, job.completed_at),
    startedAt: job.started_at,
    completedAt: job.completed_at,
    htmlUrl: job.html_url,
  }))
}

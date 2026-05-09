import type { WorkflowJob } from '../model/githubActions.types'
import type {
  PipelineNode,
  PipelineNodeStatus,
  PipelineStage,
} from '../model/pipeline.types'
import { getDurationBetween } from './githubActionsUtils'

const STAGE_ORDER = ['setup', 'quality', 'build', 'deploy', 'verify', 'other']

const STAGE_NAMES: Record<string, string> = {
  setup: 'Setup',
  quality: 'Quality',
  build: 'Build',
  deploy: 'Deploy',
  verify: 'Finalize',
  other: 'Other',
}

export function getNodeStatus(
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

export function classifyStageByName(name: string) {
  const normalizedName = name.toLowerCase()

  if (
    normalizedName.includes('post ') ||
    normalizedName.includes('post checkout') ||
    normalizedName.includes('post configure') ||
    normalizedName.includes('post deploy') ||
    normalizedName.includes('complete job')
  ) {
    return 'verify'
  }

  if (
    normalizedName.includes('set up job') ||
    normalizedName.includes('checkout') ||
    normalizedName.includes('setup node') ||
    normalizedName.includes('install') ||
    normalizedName.includes('dependencies') ||
    normalizedName.includes('npm ci')
  ) {
    return 'setup'
  }

  if (
    normalizedName.includes('lint') ||
    normalizedName.includes('type check') ||
    normalizedName.includes('test')
  ) {
    return 'quality'
  }

  if (
    normalizedName.includes('build') ||
    normalizedName.includes('vite') ||
    normalizedName.includes('npm run build')
  ) {
    return 'build'
  }

  if (
    normalizedName.includes('configure aws') ||
    normalizedName.includes('deploy') ||
    normalizedName.includes('s3') ||
    normalizedName.includes('amplify') ||
    normalizedName.includes('sync') ||
    normalizedName.includes('upload')
  ) {
    return 'deploy'
  }

  if (
    normalizedName.includes('health check') ||
    normalizedName.includes('verify')
  ) {
    return 'verify'
  }

  return 'other'
}

export function getStageStatus(nodes: PipelineNode[]): PipelineNodeStatus {
  if (nodes.some((node) => node.status === 'failure')) {
    return 'failure'
  }

  if (nodes.some((node) => node.status === 'in_progress')) {
    return 'in_progress'
  }

  if (nodes.some((node) => node.status === 'queued')) {
    return 'queued'
  }

  if (nodes.length > 0 && nodes.every((node) => node.status === 'success')) {
    return 'success'
  }

  if (nodes.length > 0 && nodes.every((node) => node.status === 'skipped')) {
    return 'skipped'
  }

  if (nodes.some((node) => node.status === 'cancelled')) {
    return 'cancelled'
  }

  return 'unknown'
}

export function buildPipelineNodes(jobs: WorkflowJob[]): PipelineNode[] {
  const stepNodes = jobs.flatMap((job) =>
    job.steps.map((step) => {
      const durationSeconds = getDurationBetween(
        step.started_at,
        step.completed_at,
      )
      const stageId = classifyStageByName(`${job.name} ${step.name}`)

      return {
        id: `step-${job.id.toString()}-${step.number.toString()}`,
        name: step.name,
        status: getNodeStatus(step.status, step.conclusion),
        conclusion: step.conclusion,
        source: 'step' as const,
        stageId,
        jobName: job.name,
        stepNumber: step.number,
        durationSeconds,
        durationInSeconds: durationSeconds,
        startedAt: step.started_at,
        completedAt: step.completed_at,
        htmlUrl: job.html_url,
      }
    }),
  )

  if (stepNodes.length > 0) {
    return stepNodes
  }

  return jobs.map((job) => {
    const durationSeconds = getDurationBetween(job.started_at, job.completed_at)
    const stageId = classifyStageByName(job.name)

    return {
      id: `job-${job.id.toString()}`,
      name: job.name,
      status: getNodeStatus(job.status, job.conclusion),
      conclusion: job.conclusion,
      source: 'job',
      stageId,
      jobName: job.name,
      durationSeconds,
      durationInSeconds: durationSeconds,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      htmlUrl: job.html_url,
    }
  })
}

export function buildPipelineStagesFromJobs(
  jobs: WorkflowJob[],
): PipelineStage[] {
  const nodes = buildPipelineNodes(jobs)
  const nodesByStage = new Map<string, PipelineNode[]>()

  for (const node of nodes) {
    const existingNodes = nodesByStage.get(node.stageId) ?? []
    nodesByStage.set(node.stageId, [...existingNodes, node])
  }

  return STAGE_ORDER.flatMap((stageId) => {
    const stageNodes = nodesByStage.get(stageId) ?? []

    if (stageNodes.length === 0) {
      return []
    }

    return [
      {
        id: stageId,
        name: STAGE_NAMES[stageId] ?? stageId,
        status: getStageStatus(stageNodes),
        nodes: stageNodes,
      },
    ]
  })
}

export function findFailedPipelineNode(stages: PipelineStage[]) {
  return stages
    .flatMap((stage) => stage.nodes)
    .find((node) => node.status === 'failure')
}

export function findRunningPipelineNode(stages: PipelineStage[]) {
  return stages
    .flatMap((stage) => stage.nodes)
    .find((node) => node.status === 'in_progress')
}

export function getPipelineProgress(stages: PipelineStage[]) {
  const nodes = stages.flatMap((stage) => stage.nodes)

  if (nodes.length === 0) {
    return 0
  }

  const completedNodes = nodes.filter((node) =>
    ['success', 'failure', 'cancelled', 'skipped'].includes(node.status),
  )

  return Math.round((completedNodes.length / nodes.length) * 100)
}

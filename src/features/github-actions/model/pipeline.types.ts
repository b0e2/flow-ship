export type PipelineNodeStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'success'
  | 'failure'
  | 'skipped'
  | 'cancelled'
  | 'unknown'

export type PipelineNodeSource = 'job' | 'step'

export type PipelineNode = {
  id: string
  name: string
  status: PipelineNodeStatus
  conclusion: string | null
  source: PipelineNodeSource
  stageId: string
  jobName: string
  stepNumber?: number
  durationSeconds: number | null
  durationInSeconds: number | null
  startedAt: string | null
  completedAt: string | null
  htmlUrl?: string
}

export type PipelineStage = {
  id: string
  name: string
  status: PipelineNodeStatus
  nodes: PipelineNode[]
}

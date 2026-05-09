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
  source: PipelineNodeSource
  jobName: string
  stepNumber?: number
  durationInSeconds: number | null
  startedAt: string | null
  completedAt: string | null
  htmlUrl?: string
}

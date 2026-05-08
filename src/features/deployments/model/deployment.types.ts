export type DeploymentStatus = 'success' | 'failed' | 'running' | 'canceled'

export type DeploymentEnvironment = 'production' | 'staging' | 'development'

export type PipelineStepStatus = 'completed' | 'running' | 'failed' | 'skipped'

export type FailureSeverity = 'low' | 'medium' | 'high'

export type Deployment = {
  id: string
  version: string
  branch: string
  commitHash: string
  status: DeploymentStatus
  environment: DeploymentEnvironment
  durationSeconds: number
  author: string
  deployedAt: string
}

export type PipelineStep = {
  id: string
  name: string
  status: PipelineStepStatus
  durationSeconds: number
}

export type EnvironmentHealth = {
  id: string
  environment: DeploymentEnvironment
  status: 'healthy' | 'warning' | 'deploying'
  version: string
  lastDeployedAt: string
  uptime: number
}

export type FailureLog = {
  id: string
  errorCode: string
  message: string
  cause: string
  severity: FailureSeverity
  occurredAt: string
}

export type ReleaseNote = {
  version: string
  releasedAt: string
  changes: string[]
}

export type DeploymentDashboardData = {
  deployments: Deployment[]
  pipelineSteps: PipelineStep[]
  environments: EnvironmentHealth[]
  failureLogs: FailureLog[]
  releaseNotes: ReleaseNote[]
}

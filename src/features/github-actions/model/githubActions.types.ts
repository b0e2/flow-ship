export type WorkflowRunActor = {
  login: string
  avatar_url: string
  html_url: string
}

export type WorkflowRun = {
  id: number
  name: string | null
  head_branch: string | null
  head_sha: string
  status: string
  conclusion: string | null
  event: string
  html_url: string
  created_at: string
  updated_at: string
  run_started_at: string | null
  actor: WorkflowRunActor
}

export type WorkflowJobStep = {
  name: string
  status: string
  conclusion: string | null
  number: number
  started_at: string | null
  completed_at: string | null
}

export type WorkflowJob = {
  id: number
  run_id: number
  name: string
  status: string
  conclusion: string | null
  started_at: string | null
  completed_at: string | null
  html_url: string
  steps: WorkflowJobStep[]
}

export type Workflow = {
  id: number
  name: string
  path: string
  state: string
  html_url: string
}

export type GitHubApiError = {
  status: number
  message: string
  documentationUrl?: string
}

export type WorkflowRunsResponse = {
  total_count: number
  workflow_runs: WorkflowRun[]
}

export type WorkflowJobsResponse = {
  total_count: number
  jobs: WorkflowJob[]
}

export type WorkflowsResponse = {
  total_count: number
  workflows: Workflow[]
}

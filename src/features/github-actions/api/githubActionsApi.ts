import type { RepositoryConfig } from '../../repository/model/repository.types'
import type {
  GitHubApiError,
  WorkflowJobsResponse,
  WorkflowRunsResponse,
  WorkflowsResponse,
} from '../model/githubActions.types'

const GITHUB_API_BASE_URL = 'https://api.github.com'

type GitHubErrorPayload = {
  message?: string
  documentation_url?: string
}

function getRepositoryPath(config: RepositoryConfig) {
  return `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
    config.repo,
  )}`
}

function getHeaders(config: RepositoryConfig) {
  const headers = new Headers({
    Accept: 'application/vnd.github+json',
  })

  if (config.token) {
    headers.set('Authorization', `Bearer ${config.token}`)
  }

  return headers
}

function isGitHubErrorPayload(value: unknown): value is GitHubErrorPayload {
  return typeof value === 'object' && value !== null
}

async function parseGitHubApiError(
  response: Response,
): Promise<GitHubApiError> {
  const payload: unknown = await response.json().catch(() => null)

  if (isGitHubErrorPayload(payload)) {
    return {
      status: response.status,
      message:
        typeof payload.message === 'string'
          ? payload.message
          : response.statusText,
      documentationUrl:
        typeof payload.documentation_url === 'string'
          ? payload.documentation_url
          : undefined,
    }
  }

  return {
    status: response.status,
    message: response.statusText,
  }
}

async function requestGitHubApi<TResponse>(
  path: string,
  config: RepositoryConfig,
) {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: getHeaders(config),
  })

  if (!response.ok) {
    throw await parseGitHubApiError(response)
  }

  return response.json() as Promise<TResponse>
}

export function getWorkflowRuns(config: RepositoryConfig, perPage = 20) {
  const searchParams = new URLSearchParams({
    branch: config.branch,
    per_page: perPage.toString(),
  })

  return requestGitHubApi<WorkflowRunsResponse>(
    `${getRepositoryPath(config)}/actions/runs?${searchParams.toString()}`,
    config,
  )
}

export function getWorkflowJobs(config: RepositoryConfig, runId: number) {
  return requestGitHubApi<WorkflowJobsResponse>(
    `${getRepositoryPath(config)}/actions/runs/${runId.toString()}/jobs`,
    config,
  )
}

export function getWorkflows(config: RepositoryConfig) {
  return requestGitHubApi<WorkflowsResponse>(
    `${getRepositoryPath(config)}/actions/workflows`,
    config,
  )
}

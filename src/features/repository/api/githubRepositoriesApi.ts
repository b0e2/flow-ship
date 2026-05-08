import type { GitHubApiError } from '../../github-actions/model/githubActions.types'

const GITHUB_API_BASE_URL = 'https://api.github.com'

export type GitHubRepository = {
  id: number
  name: string
  fullName: string
  ownerLogin: string
  defaultBranch: string
  private: boolean
  htmlUrl: string
}

type GitHubRepositoryPayload = {
  id?: unknown
  name?: unknown
  full_name?: unknown
  default_branch?: unknown
  private?: unknown
  html_url?: unknown
  owner?: {
    login?: unknown
  }
}

type GitHubErrorPayload = {
  message?: string
  documentation_url?: string
}

type RepositoryListOptions = {
  owner?: string
  token?: string
}

function getHeaders(token?: string) {
  const headers = new Headers({
    Accept: 'application/vnd.github+json',
  })

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isGitHubErrorPayload(value: unknown): value is GitHubErrorPayload {
  return isRecord(value)
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

function toGitHubRepository(
  payload: GitHubRepositoryPayload,
): GitHubRepository | null {
  if (
    typeof payload.id !== 'number' ||
    typeof payload.name !== 'string' ||
    typeof payload.full_name !== 'string' ||
    typeof payload.default_branch !== 'string' ||
    typeof payload.private !== 'boolean' ||
    typeof payload.html_url !== 'string' ||
    typeof payload.owner?.login !== 'string'
  ) {
    return null
  }

  return {
    id: payload.id,
    name: payload.name,
    fullName: payload.full_name,
    ownerLogin: payload.owner.login,
    defaultBranch: payload.default_branch,
    private: payload.private,
    htmlUrl: payload.html_url,
  }
}

export async function listGitHubRepositories({
  owner,
  token,
}: RepositoryListOptions) {
  const trimmedOwner = owner?.trim()
  const trimmedToken = token?.trim()
  const path = trimmedToken
    ? '/user/repos?per_page=100&sort=updated'
    : `/users/${encodeURIComponent(trimmedOwner ?? '')}/repos?per_page=100&sort=updated`

  if (!trimmedToken && !trimmedOwner) {
    throw {
      status: 400,
      message:
        'GitHub owner를 입력하거나 token을 입력해야 repository 목록을 불러올 수 있습니다.',
    } satisfies GitHubApiError
  }

  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: getHeaders(trimmedToken),
  })

  if (!response.ok) {
    throw await parseGitHubApiError(response)
  }

  const payload: unknown = await response.json()

  if (!Array.isArray(payload)) {
    throw {
      status: response.status,
      message: 'GitHub repository 목록 응답 형식이 올바르지 않습니다.',
    } satisfies GitHubApiError
  }

  return payload
    .map((item: unknown) => (isRecord(item) ? toGitHubRepository(item) : null))
    .filter((repository): repository is GitHubRepository => repository !== null)
}

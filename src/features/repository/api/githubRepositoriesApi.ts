import type { GitHubApiError } from '../../github-actions/model/githubActions.types'

const GITHUB_API_BASE_URL = 'https://api.github.com'

export type GitHubRepository = {
  id: number
  name: string
  fullName: string
  ownerLogin: string
  owner: {
    login: string
    type: string
    avatarUrl: string
  }
  defaultBranch: string
  private: boolean
  htmlUrl: string
  updatedAt: string
  description: string | null
}

export type GitHubViewer = {
  login: string
  avatarUrl: string
  htmlUrl: string
}

type GitHubRepositoryPayload = {
  id?: unknown
  name?: unknown
  full_name?: unknown
  default_branch?: unknown
  private?: unknown
  html_url?: unknown
  updated_at?: unknown
  description?: unknown
  owner?: {
    login?: unknown
    type?: unknown
    avatar_url?: unknown
  }
}

type GitHubViewerPayload = {
  login?: unknown
  avatar_url?: unknown
  html_url?: unknown
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
    owner: {
      login: payload.owner.login,
      type: typeof payload.owner.type === 'string' ? payload.owner.type : '',
      avatarUrl:
        typeof payload.owner.avatar_url === 'string'
          ? payload.owner.avatar_url
          : '',
    },
    defaultBranch: payload.default_branch,
    private: payload.private,
    htmlUrl: payload.html_url,
    updatedAt: typeof payload.updated_at === 'string' ? payload.updated_at : '',
    description:
      typeof payload.description === 'string' ? payload.description : null,
  }
}

function toGitHubViewer(payload: GitHubViewerPayload): GitHubViewer | null {
  if (
    typeof payload.login !== 'string' ||
    typeof payload.avatar_url !== 'string' ||
    typeof payload.html_url !== 'string'
  ) {
    return null
  }

  return {
    login: payload.login,
    avatarUrl: payload.avatar_url,
    htmlUrl: payload.html_url,
  }
}

async function requestGitHub(path: string, token?: string) {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: getHeaders(token),
  })

  if (!response.ok) {
    throw await parseGitHubApiError(response)
  }

  return response
}

async function fetchRepositoryList(path: string, token?: string) {
  const response = await requestGitHub(path, token)
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

export async function listGitHubRepositories({
  owner,
  token,
}: RepositoryListOptions) {
  const trimmedOwner = owner?.trim()
  const trimmedToken = token?.trim()

  if (!trimmedToken && !trimmedOwner) {
    throw {
      status: 400,
      message:
        'GitHub owner를 입력하거나 token을 입력해야 repository 목록을 불러올 수 있습니다.',
    } satisfies GitHubApiError
  }

  if (trimmedToken) {
    const repositories = await fetchRepositoryList(
      '/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&per_page=100&sort=updated',
      trimmedToken,
    )

    if (!trimmedOwner) {
      return repositories
    }

    const normalizedOwner = trimmedOwner.toLowerCase()

    return repositories.filter((repository) => {
      return (
        repository.ownerLogin.toLowerCase() === normalizedOwner ||
        repository.fullName.toLowerCase().startsWith(`${normalizedOwner}/`)
      )
    })
  }

  const encodedOwner = encodeURIComponent(trimmedOwner ?? '')

  try {
    return await fetchRepositoryList(
      `/users/${encodedOwner}/repos?per_page=100&sort=updated`,
    )
  } catch (error) {
    if (isRecord(error) && error.status === 404) {
      return fetchRepositoryList(
        `/orgs/${encodedOwner}/repos?per_page=100&sort=updated`,
      )
    }

    throw error
  }
}

export async function validateGitHubToken(token: string) {
  const trimmedToken = token.trim()

  if (!trimmedToken) {
    throw {
      status: 400,
      message: 'GitHub token을 입력하세요.',
    } satisfies GitHubApiError
  }

  const response = await requestGitHub('/user', trimmedToken)
  const payload: unknown = await response.json()

  if (!isRecord(payload)) {
    throw {
      status: response.status,
      message: 'GitHub user 응답 형식이 올바르지 않습니다.',
    } satisfies GitHubApiError
  }

  const viewer = toGitHubViewer(payload)

  if (!viewer) {
    throw {
      status: response.status,
      message: 'GitHub user 응답 형식이 올바르지 않습니다.',
    } satisfies GitHubApiError
  }

  return viewer
}

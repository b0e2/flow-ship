import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  GitPullRequest,
  Link,
  Loader2,
  LockKeyhole,
  PlugZap,
  RefreshCw,
} from 'lucide-react'
import {
  listGitHubRepositories,
  type GitHubRepository,
} from '../api/githubRepositoriesApi'
import type { RepositoryConfig } from '../model/repository.types'
import { useRepositoryConfigStore } from '../store/repositoryConfigStore'
import type { GitHubApiError } from '../../github-actions/model/githubActions.types'

type RepositorySetupPanelProps = {
  initialConfig?: RepositoryConfig | null
  onSaved?: () => void
}

type RepositoryFormState = {
  owner: string
  repo: string
  branch: string
  token: string
  s3WebsiteUrl: string
  amplifyUrl: string
}

function toFormState(config?: RepositoryConfig | null): RepositoryFormState {
  return {
    owner: config?.owner ?? '',
    repo: config?.repo ?? '',
    branch: config?.branch ?? 'main',
    token: config?.token ?? '',
    s3WebsiteUrl: config?.s3WebsiteUrl ?? '',
    amplifyUrl: config?.amplifyUrl ?? '',
  }
}

function sanitizeOptionalValue(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function isGitHubApiError(error: unknown): error is GitHubApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof error.status === 'number' &&
    typeof error.message === 'string'
  )
}

export function RepositorySetupPanel({
  initialConfig = null,
  onSaved,
}: RepositorySetupPanelProps) {
  const setConfig = useRepositoryConfigStore((state) => state.setConfig)
  const [form, setForm] = useState<RepositoryFormState>(() =>
    toFormState(initialConfig),
  )
  const [error, setError] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false)

  const updateField = (field: keyof RepositoryFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLoadRepositories = async () => {
    setIsLoadingRepositories(true)
    setError(null)

    try {
      const loadedRepositories = await listGitHubRepositories({
        owner: form.owner,
        token: form.token,
      })
      setRepositories(loadedRepositories)

      if (loadedRepositories.length === 0) {
        setError('불러올 수 있는 repository가 없습니다.')
      }
    } catch (caughtError) {
      const message = isGitHubApiError(caughtError)
        ? `${caughtError.status.toString()} · ${caughtError.message}`
        : 'GitHub repository 목록을 불러오지 못했습니다.'
      setError(message)
    } finally {
      setIsLoadingRepositories(false)
    }
  }

  const handleRepositorySelect = (repositoryId: string) => {
    const selectedRepository = repositories.find(
      (repository) => repository.id.toString() === repositoryId,
    )

    if (!selectedRepository) {
      return
    }

    setForm((current) => ({
      ...current,
      owner: selectedRepository.ownerLogin,
      repo: selectedRepository.name,
      branch: selectedRepository.defaultBranch,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const owner = form.owner.trim()
    const repo = form.repo.trim()
    const branch = form.branch.trim()

    if (!owner || !repo || !branch) {
      setError('GitHub owner, repository name, branch는 필수입니다.')
      return
    }

    setConfig({
      owner,
      repo,
      branch,
      token: sanitizeOptionalValue(form.token),
      s3WebsiteUrl: sanitizeOptionalValue(form.s3WebsiteUrl),
      amplifyUrl: sanitizeOptionalValue(form.amplifyUrl),
    })
    setError(null)
    onSaved?.()
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Repository setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Connect a GitHub repository
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Public repositories can be inspected without a token. Private
            repositories or rate limit avoidance may require an optional GitHub
            token.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <GitPullRequest aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                GitHub repository 자동 불러오기
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                token이 있으면 접근 가능한 repository를, token이 없으면 입력한
                owner의 public repository를 불러옵니다.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingRepositories}
              onClick={handleLoadRepositories}
              type="button"
            >
              {isLoadingRepositories ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
              )}
              Load repositories
            </button>
          </div>

          {repositories.length > 0 ? (
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">
                불러온 repository 선택
              </span>
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                defaultValue=""
                onChange={(event) => handleRepositorySelect(event.target.value)}
              >
                <option disabled value="">
                  repository를 선택하세요
                </option>
                {repositories.map((repository) => (
                  <option key={repository.id} value={repository.id}>
                    {repository.fullName} · {repository.defaultBranch}
                    {repository.private ? ' · private' : ' · public'}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              GitHub owner
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) => updateField('owner', event.target.value)}
              placeholder="facebook"
              required
              type="text"
              value={form.owner}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Repository name
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) => updateField('repo', event.target.value)}
              placeholder="react"
              required
              type="text"
              value={form.repo}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Branch</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) => updateField('branch', event.target.value)}
              placeholder="main"
              required
              type="text"
              value={form.branch}
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              GitHub token optional
            </span>
            <input
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) => updateField('token', event.target.value)}
              placeholder="ghp_..."
              type="password"
              value={form.token}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Link aria-hidden="true" className="h-4 w-4" />
              S3 Website URL optional
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) =>
                updateField('s3WebsiteUrl', event.target.value)
              }
              placeholder="https://example.s3-website..."
              type="url"
              value={form.s3WebsiteUrl}
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Link aria-hidden="true" className="h-4 w-4" />
              Amplify URL optional
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) =>
                updateField('amplifyUrl', event.target.value)
              }
              placeholder="https://main.example.amplifyapp.com"
              type="url"
              value={form.amplifyUrl}
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 sm:w-auto"
          type="submit"
        >
          <PlugZap aria-hidden="true" className="h-4 w-4" />
          Connect Repository
        </button>
      </form>
    </section>
  )
}

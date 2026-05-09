import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GitPullRequest,
  Loader2,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react'
import type { GitHubApiError } from '../../github-actions/model/githubActions.types'
import {
  listGitHubRepositories,
  type GitHubRepository,
} from '../api/githubRepositoriesApi'
import type { RepositoryConfig } from '../model/repository.types'
import { useRepositoryConfigStore } from '../store/repositoryConfigStore'

type RepositorySetupPanelProps = {
  initialConfig?: RepositoryConfig | null
  onSaved?: () => void
}

type RepositoryWizardStep = 1 | 2 | 3 | 4

type RepositoryFormState = {
  name: string
  owner: string
  repo: string
  branch: string
  token: string
  s3WebsiteUrl: string
  amplifyUrl: string
}

const WIZARD_STEPS = [
  'GitHub owner',
  'Repository',
  'Branch & targets',
  'Confirm',
]

function toFormState(config?: RepositoryConfig | null): RepositoryFormState {
  return {
    name: config?.name ?? '',
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

function formatRepositoryUpdatedAt(value: string) {
  if (!value) {
    return 'updated date unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'updated date unavailable'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
  }).format(date)
}

export function RepositorySetupPanel({
  initialConfig = null,
  onSaved,
}: RepositorySetupPanelProps) {
  const addRepository = useRepositoryConfigStore((state) => state.addRepository)
  const updateRepository = useRepositoryConfigStore(
    (state) => state.updateRepository,
  )
  const setActiveRepository = useRepositoryConfigStore(
    (state) => state.setActiveRepository,
  )
  const [step, setStep] = useState<RepositoryWizardStep>(initialConfig ? 3 : 1)
  const [form, setForm] = useState<RepositoryFormState>(() =>
    toFormState(initialConfig),
  )
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<
    number | null
  >(null)
  const [repositorySearch, setRepositorySearch] = useState('')
  const [isManualEntry, setIsManualEntry] = useState(Boolean(initialConfig))
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    Boolean(initialConfig?.token),
  )
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredRepositories = useMemo(() => {
    const query = repositorySearch.trim().toLowerCase()

    if (!query) {
      return repositories
    }

    return repositories.filter((repository) => {
      return (
        repository.name.toLowerCase().includes(query) ||
        repository.fullName.toLowerCase().includes(query) ||
        (repository.description?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [repositories, repositorySearch])

  const updateField = (field: keyof RepositoryFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const loadRepositories = async () => {
    const owner = form.owner.trim()

    if (!owner) {
      setError('GitHub owner를 먼저 입력하세요.')
      return
    }

    setIsLoadingRepositories(true)
    setError(null)

    try {
      const loadedRepositories = await listGitHubRepositories({
        owner,
        token: form.token,
      })

      setRepositories(loadedRepositories)
      setSelectedRepositoryId(null)
      setIsManualEntry(false)
      setStep(2)

      if (loadedRepositories.length === 0) {
        setError(
          '데이터 없음: 이 owner에서 public repository를 찾지 못했습니다.',
        )
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

  const selectRepository = (repository: GitHubRepository) => {
    setSelectedRepositoryId(repository.id)
    setIsManualEntry(false)
    setForm((current) => ({
      ...current,
      name: current.name || repository.name,
      owner: repository.ownerLogin,
      repo: repository.name,
      branch: repository.defaultBranch || 'main',
    }))
    setError(null)
  }

  const goNext = () => {
    setError(null)

    if (step === 1) {
      if (!form.owner.trim()) {
        setError('GitHub owner를 입력하세요.')
        return
      }

      void loadRepositories()
      return
    }

    if (step === 2) {
      if (!form.repo.trim()) {
        setError('repository를 선택하거나 수동 입력하세요.')
        return
      }
      setStep(3)
      return
    }

    if (step === 3) {
      if (!form.branch.trim()) {
        setError('branch는 필수입니다.')
        return
      }
      setStep(4)
    }
  }

  const saveRepository = () => {
    const owner = form.owner.trim()
    const repo = form.repo.trim()
    const branch = form.branch.trim()
    const name = form.name.trim() || repo

    if (!owner || !repo || !branch) {
      setError('owner, repository, branch를 확인하세요.')
      return
    }

    const repository: RepositoryConfig = {
      id: initialConfig?.id ?? `${owner}/${repo}:${branch}`,
      name,
      owner,
      repo,
      branch,
      token: sanitizeOptionalValue(form.token),
      s3WebsiteUrl: sanitizeOptionalValue(form.s3WebsiteUrl),
      amplifyUrl: sanitizeOptionalValue(form.amplifyUrl),
    }

    if (initialConfig) {
      updateRepository(initialConfig.id, repository)
      setActiveRepository(repository.id)
    } else {
      addRepository(repository)
    }

    setError(null)
    onSaved?.()
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl bg-slate-950 p-5 text-white">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <GitPullRequest aria-hidden="true" className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">
          Add deployment project
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Start with a GitHub owner, load real repositories from GitHub, then
          configure branch and deploy target URLs.
        </p>

        <ol className="mt-6 space-y-2">
          {WIZARD_STEPS.map((label, index) => {
            const stepNumber = (index + 1) as RepositoryWizardStep
            const isActive = step === stepNumber
            const isComplete = step > stepNumber

            return (
              <li
                className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
                  isActive
                    ? 'bg-white text-slate-950'
                    : 'bg-white/5 text-slate-300'
                }`}
                key={label}
              >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                  {isComplete ? (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </span>
                {label}
              </li>
            )
          })}
        </ol>
      </aside>

      <div className="min-h-[520px] rounded-3xl border border-slate-200 bg-slate-50 p-5">
        {step === 1 ? (
          <div className="mx-auto flex max-w-3xl flex-col justify-center py-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Step 1
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              GitHub owner를 입력하세요.
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              예: boe2, facebook, vercel. Public repository는 token 없이 조회할
              수 있습니다.
            </p>

            <label className="mt-8 block">
              <span className="text-sm font-semibold text-slate-700">
                GitHub owner
              </span>
              <input
                autoFocus
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-lg font-semibold text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                onChange={(event) => updateField('owner', event.target.value)}
                placeholder="boe2"
                type="text"
                value={form.owner}
              />
            </label>

            <button
              className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
              onClick={() => setIsAdvancedOpen((current) => !current)}
              type="button"
            >
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              Optional advanced token
            </button>

            {isAdvancedOpen ? (
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-700">
                  GitHub token optional
                </span>
                <input
                  autoComplete="off"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  onChange={(event) => updateField('token', event.target.value)}
                  placeholder="ghp_..."
                  type="password"
                  value={form.token}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Private repository 접근 또는 rate limit 회피가 필요할 때만
                  사용하세요. token 값은 화면에 직접 표시하지 않습니다.
                </p>
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Step 2
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Repository를 선택하세요.
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  GitHub API가 반환한 실제 repository 목록입니다.
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
                disabled={isLoadingRepositories}
                onClick={loadRepositories}
                type="button"
              >
                {isLoadingRepositories ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                )}
                Reload repositories
              </button>
            </div>

            <input
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              onChange={(event) => setRepositorySearch(event.target.value)}
              placeholder="Search repositories"
              type="search"
              value={repositorySearch}
            />

            {isLoadingRepositories ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">
                <Loader2
                  aria-hidden="true"
                  className="mx-auto mb-3 h-6 w-6 animate-spin"
                />
                Repository 목록을 불러오고 있습니다.
              </div>
            ) : filteredRepositories.length > 0 ? (
              <div className="grid max-h-[430px] gap-3 overflow-auto pr-1 lg:grid-cols-2">
                {filteredRepositories.map((repository) => (
                  <button
                    className={`rounded-2xl border bg-white p-4 text-left transition hover:border-slate-500 ${
                      selectedRepositoryId === repository.id
                        ? 'border-slate-950 ring-2 ring-slate-950/10'
                        : 'border-slate-200'
                    }`}
                    key={repository.id}
                    onClick={() => selectRepository(repository)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {repository.name}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {repository.fullName}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {repository.private ? 'private' : 'public'}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {repository.description ?? 'No description'}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      default: {repository.defaultBranch} ·{' '}
                      {formatRepositoryUpdatedAt(repository.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="font-semibold text-slate-950">데이터 없음</p>
                <p className="mt-2 text-sm text-slate-600">
                  이 owner에서 조회 가능한 repository가 없습니다. private repo는
                  token이 필요할 수 있습니다.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  checked={isManualEntry}
                  onChange={(event) => setIsManualEntry(event.target.checked)}
                  type="checkbox"
                />
                Repository 수동 입력 fallback
              </label>

              {isManualEntry ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Repository name
                    </span>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                      onChange={(event) =>
                        updateField('repo', event.target.value)
                      }
                      placeholder="flow-ship"
                      type="text"
                      value={form.repo}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                      Project name
                    </span>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                      onChange={(event) =>
                        updateField('name', event.target.value)
                      }
                      placeholder="Production web"
                      type="text"
                      value={form.name}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mx-auto max-w-4xl space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Step 3
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Branch와 deploy target을 설정하세요.
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                S3/Amplify URL은 나중에 추가해도 됩니다. AWS credential은
                프론트엔드에서 입력받지 않습니다.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Project name
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Production web"
                  type="text"
                  value={form.name}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Branch
                </span>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  onChange={(event) =>
                    updateField('branch', event.target.value)
                  }
                  placeholder="main"
                  type="text"
                  value={form.branch}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
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
                <span className="text-sm font-semibold text-slate-700">
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
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Step 4
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              설정을 확인하세요.
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ['Project', form.name.trim() || form.repo || '데이터 없음'],
                [
                  'Repository',
                  `${form.owner || 'owner'}/${form.repo || 'repo'}`,
                ],
                ['Branch', form.branch || '데이터 없음'],
                ['Token', form.token ? 'Token configured' : 'Public API mode'],
                ['S3 URL', form.s3WebsiteUrl || '나중에 추가 가능'],
                ['Amplify URL', form.amplifyUrl || '나중에 추가 가능'],
              ].map(([label, value]) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                  key={label}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={step === 1}
            onClick={() =>
              setStep(
                (current) => Math.max(1, current - 1) as RepositoryWizardStep,
              )
            }
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingRepositories}
              onClick={goNext}
              type="button"
            >
              {isLoadingRepositories ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              )}
              Next
            </button>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={saveRepository}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {initialConfig ? 'Update Repository' : 'Add Repository'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

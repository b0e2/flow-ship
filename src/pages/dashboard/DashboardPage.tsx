import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { AppShell } from '../../shared/components/layout/AppShell'
import { DeploymentHealthPanel } from '../../features/github-actions/components/DeploymentHealthPanel'
import { FailureDetails } from '../../features/github-actions/components/FailureDetails'
import { FailureDiagnosisPanel } from '../../features/github-actions/components/FailureDiagnosisPanel'
import { PipelineDependencyGraph } from '../../features/github-actions/components/PipelineDependencyGraph'
import { WorkflowJobTimeline } from '../../features/github-actions/components/WorkflowJobTimeline'
import { WorkflowMetrics } from '../../features/github-actions/components/WorkflowMetrics'
import { WorkflowRunSummary } from '../../features/github-actions/components/WorkflowRunSummary'
import { WorkflowRunTable } from '../../features/github-actions/components/WorkflowRunTable'
import { useDeployTargetHealth } from '../../features/github-actions/hooks/useDeployTargetHealth'
import { useRepositoryLatestRuns } from '../../features/github-actions/hooks/useRepositoryLatestRuns'
import { useWorkflowJobs } from '../../features/github-actions/hooks/useWorkflowJobs'
import { useWorkflowRuns } from '../../features/github-actions/hooks/useWorkflowRuns'
import type {
  GitHubApiError,
  WorkflowRun,
} from '../../features/github-actions/model/githubActions.types'
import { useGitHubActionsUiStore } from '../../features/github-actions/store/githubActionsUiStore'
import {
  findLatestRun,
  formatWorkflowStatus,
  isRunningWorkflowStatus,
} from '../../features/github-actions/utils/githubActionsUtils'
import { MultiProjectOverview } from '../../features/repository/components/MultiProjectOverview'
import { RepositoryList } from '../../features/repository/components/RepositoryList'
import { RepositorySetupPanel } from '../../features/repository/components/RepositorySetupPanel'
import type { RepositoryConfig } from '../../features/repository/model/repository.types'
import { useRepositoryConfigStore } from '../../features/repository/store/repositoryConfigStore'
import { getDefaultRepositoryConfig } from '../../features/repository/utils/defaultRepositoryConfig'

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

function getErrorHelp(error: GitHubApiError) {
  if (error.status === 404) {
    return 'Repository를 찾을 수 없습니다. private repository라면 token이 필요할 수 있습니다.'
  }

  if (error.status === 403) {
    return 'GitHub API rate limit 또는 권한 문제일 수 있습니다. token 설정을 확인하세요.'
  }

  return 'GitHub Actions API 요청에 실패했습니다. repository 설정과 네트워크 상태를 확인하세요.'
}

function formatLastUpdatedAt(value: number) {
  if (value === 0) {
    return '아직 갱신 전'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function getRunStatusLabel(run: WorkflowRun | null) {
  if (!run) {
    return 'No workflow run'
  }

  return formatWorkflowStatus(run.status, run.conclusion)
}

export function DashboardPage() {
  const repositories = useRepositoryConfigStore((state) => state.repositories)
  const activeRepositoryId = useRepositoryConfigStore(
    (state) => state.activeRepositoryId,
  )
  const hasHydratedRepositoryConfig = useRepositoryConfigStore(
    (state) => state.hasHydrated,
  )
  const setConfig = useRepositoryConfigStore((state) => state.setConfig)
  const setActiveRepository = useRepositoryConfigStore(
    (state) => state.setActiveRepository,
  )
  const selectedRunId = useGitHubActionsUiStore((state) => state.selectedRunId)
  const setSelectedRunId = useGitHubActionsUiStore(
    (state) => state.setSelectedRunId,
  )
  const [editingRepository, setEditingRepository] =
    useState<RepositoryConfig | null>(null)
  const [isEditingRepository, setIsEditingRepository] = useState(false)
  const hasAttemptedDefaultBootstrap = useRef(false)
  const activeRepository =
    repositories.find((repository) => repository.id === activeRepositoryId) ??
    null
  const shouldShowSetup = repositories.length === 0 || isEditingRepository
  const repositoryLatestRunStates = useRepositoryLatestRuns(repositories)
  const workflowRunsQuery = useWorkflowRuns(activeRepository)
  const deployTargetHealthQuery = useDeployTargetHealth(activeRepository)
  const runs = useMemo(
    () => workflowRunsQuery.data?.workflow_runs ?? [],
    [workflowRunsQuery.data?.workflow_runs],
  )
  const latestRun = findLatestRun(runs)
  const isWatchingLatestRun = latestRun
    ? isRunningWorkflowStatus(latestRun.status)
    : false
  const selectedRun =
    runs.find((run) => run.id === selectedRunId) ?? latestRun ?? null
  const workflowJobsQuery = useWorkflowJobs(
    activeRepository,
    selectedRun?.id ?? null,
  )
  const jobs = workflowJobsQuery.data?.jobs ?? []

  useEffect(() => {
    if (
      !hasHydratedRepositoryConfig ||
      hasAttemptedDefaultBootstrap.current ||
      repositories.length > 0 ||
      isEditingRepository
    ) {
      return
    }

    hasAttemptedDefaultBootstrap.current = true

    const defaultConfig = getDefaultRepositoryConfig()

    if (defaultConfig) {
      setConfig(defaultConfig)
    }
  }, [
    hasHydratedRepositoryConfig,
    isEditingRepository,
    repositories.length,
    setConfig,
  ])

  useEffect(() => {
    const hasSelectedRun = runs.some((run) => run.id === selectedRunId)

    if ((!selectedRunId || !hasSelectedRun) && latestRun) {
      setSelectedRunId(latestRun.id)
    }
  }, [latestRun, runs, selectedRunId, setSelectedRunId])

  if (shouldShowSetup) {
    return (
      <AppShell>
        <div className="flex min-h-[calc(100vh-112px)] flex-col gap-4">
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Deployment Control Center setup
            </p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Repository를 단계별로 연결하세요.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  owner를 먼저 입력하고 GitHub API에서 실제 repository 목록을
                  불러온 뒤, branch와 deploy target URL을 분리해서 설정합니다.
                </p>
              </div>
              {repositories.length === 0 && getDefaultRepositoryConfig() ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  env 기반 기본 설정을 감지했습니다.
                </p>
              ) : null}
            </div>
          </section>
          <RepositorySetupPanel
            initialConfig={editingRepository}
            onSaved={() => {
              setEditingRepository(null)
              setIsEditingRepository(false)
            }}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-96px)] flex-col gap-3 xl:h-[calc(100vh-96px)] xl:overflow-hidden">
        <section className="flex shrink-0 flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              FlowShip Deployment Control Center
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                {activeRepository
                  ? `${activeRepository.owner}/${activeRepository.repo}`
                  : 'Repository not selected'}
              </h1>
              {activeRepository ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {activeRepository.branch}
                </span>
              ) : null}
              {isWatchingLatestRun ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Watching latest workflow run
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Latest run
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {getRunStatusLabel(latestRun)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Last updated
              </p>
              <p className="text-sm font-semibold text-slate-950">
                {formatLastUpdatedAt(workflowRunsQuery.dataUpdatedAt)}
              </p>
            </div>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-500"
              onClick={() => {
                void workflowRunsQuery.refetch()
                void workflowJobsQuery.refetch()
              }}
              type="button"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${
                  workflowRunsQuery.isFetching || workflowJobsQuery.isFetching
                    ? 'animate-spin'
                    : ''
                }`}
              />
              Refresh
            </button>
            <button
              className="h-11 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              onClick={() => {
                setEditingRepository(null)
                setIsEditingRepository(true)
              }}
              type="button"
            >
              Add project
            </button>
            {activeRepository ? (
              <button
                className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-500"
                onClick={() => {
                  setEditingRepository(activeRepository)
                  setIsEditingRepository(true)
                }}
                type="button"
              >
                Change
              </button>
            ) : null}
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:grid-rows-[minmax(0,1fr)_250px] xl:overflow-hidden">
          <aside className="flex min-h-0 flex-col gap-3 overflow-hidden xl:row-span-2">
            <div className="shrink-0">
              <MultiProjectOverview items={repositoryLatestRunStates} />
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <RepositoryList
                activeRepositoryId={activeRepositoryId}
                items={repositoryLatestRunStates}
                onSelectRepository={setActiveRepository}
              />
            </div>
            <button
              className="shrink-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-500"
              onClick={() => {
                setEditingRepository(null)
                setIsEditingRepository(true)
              }}
              type="button"
            >
              Add project
            </button>
          </aside>

          <main className="min-h-[560px] overflow-hidden xl:min-h-0">
            {activeRepository && workflowRunsQuery.isLoading ? (
              <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <Loader2
                  aria-hidden="true"
                  className="h-8 w-8 animate-spin text-slate-400"
                />
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Loading
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  GitHub Actions workflow runs를 조회하고 있습니다.
                </h2>
              </section>
            ) : null}

            {activeRepository && workflowRunsQuery.isError ? (
              <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
                <AlertTriangle
                  aria-hidden="true"
                  className="h-8 w-8 text-red-500"
                />
                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-red-600">
                  API error
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-red-950">
                  실제 workflow runs를 가져오지 못했습니다.
                </h2>
                {isGitHubApiError(workflowRunsQuery.error) ? (
                  <>
                    <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-red-800">
                      {workflowRunsQuery.error.status.toString()} ·{' '}
                      {workflowRunsQuery.error.message}
                    </p>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-red-700">
                      {getErrorHelp(workflowRunsQuery.error)}
                    </p>
                  </>
                ) : (
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-red-700">
                    알 수 없는 오류가 발생했습니다.
                  </p>
                )}
              </section>
            ) : null}

            {activeRepository &&
            workflowRunsQuery.isSuccess &&
            runs.length === 0 ? (
              <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  데이터 없음
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Workflow run 데이터가 없습니다.
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  현재 설정된 repository와 branch에서 GitHub Actions API가
                  반환한 workflow run이 없습니다. FlowShip은 임의의 deployment
                  history를 표시하지 않습니다.
                </p>
              </section>
            ) : null}

            {activeRepository && workflowRunsQuery.isSuccess && latestRun ? (
              <PipelineDependencyGraph
                isLoading={workflowJobsQuery.isLoading}
                jobs={jobs}
                run={selectedRun ?? latestRun}
              />
            ) : null}
          </main>

          <aside className="min-h-0 space-y-3 overflow-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
            {activeRepository ? (
              <>
                <FailureDiagnosisPanel
                  isLoading={workflowJobsQuery.isLoading}
                  jobs={jobs}
                />
                <DeploymentHealthPanel
                  config={activeRepository}
                  healthResults={deployTargetHealthQuery.data ?? []}
                  isLoading={deployTargetHealthQuery.isLoading}
                  latestRun={latestRun}
                />
              </>
            ) : (
              <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm font-medium text-slate-600 shadow-sm">
                active repository를 선택하면 실패 진단과 배포 URL 상태가 여기에
                표시됩니다.
              </section>
            )}
          </aside>

          <section className="min-h-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm xl:col-span-2 xl:min-h-0">
            {activeRepository && workflowRunsQuery.isSuccess && latestRun ? (
              <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-h-0 space-y-3 overflow-auto pr-1">
                  <WorkflowMetrics runs={runs} />
                  <WorkflowRunSummary run={selectedRun ?? latestRun} />
                  <WorkflowRunTable
                    onSelectRun={setSelectedRunId}
                    runs={runs}
                    selectedRunId={selectedRun?.id ?? null}
                  />
                </div>

                <div className="min-h-0 space-y-3 overflow-auto pr-1">
                  {workflowJobsQuery.isError ? (
                    <section className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mx-auto h-8 w-8 text-red-500"
                      />
                      <h2 className="mt-3 text-xl font-semibold tracking-tight text-red-950">
                        선택된 run의 jobs를 가져오지 못했습니다.
                      </h2>
                    </section>
                  ) : (
                    <>
                      <WorkflowJobTimeline
                        isLoading={workflowJobsQuery.isLoading}
                        jobs={jobs}
                      />
                      {workflowJobsQuery.isSuccess ? (
                        <FailureDetails jobs={jobs} />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm font-semibold text-slate-500">
                실제 workflow run이 있으면 최근 runs와 job detail이 여기에
                표시됩니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}

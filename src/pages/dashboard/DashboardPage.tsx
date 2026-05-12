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

type DashboardPanel = 'diagnosis' | 'health' | 'runs' | 'jobs'

const DASHBOARD_PANELS: Array<{
  id: DashboardPanel
  label: string
  description: string
}> = [
  {
    id: 'diagnosis',
    label: 'Failure diagnosis',
    description: '원인과 해결 액션',
  },
  {
    id: 'health',
    label: 'Deploy health',
    description: 'S3/Amplify URL 상태',
  },
  {
    id: 'runs',
    label: 'Workflow runs',
    description: '최근 실행과 KPI',
  },
  {
    id: 'jobs',
    label: 'Jobs & steps',
    description: '선택 run 상세',
  },
]

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
    return 'GitHub API rate limit 또는 권한 문제일 수 있습니다. repository는 조회되지만 Actions 권한이 부족할 수 있습니다. fine-grained token은 Repository access와 Actions read, classic token은 repo, workflow, read:org 권한을 확인하세요.'
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
  const removeRepository = useRepositoryConfigStore(
    (state) => state.removeRepository,
  )
  const selectedRunId = useGitHubActionsUiStore((state) => state.selectedRunId)
  const setSelectedRunId = useGitHubActionsUiStore(
    (state) => state.setSelectedRunId,
  )
  const [editingRepository, setEditingRepository] =
    useState<RepositoryConfig | null>(null)
  const [isEditingRepository, setIsEditingRepository] = useState(false)
  const [selectedPanel, setSelectedPanel] =
    useState<DashboardPanel>('diagnosis')
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
        <div className="flex min-h-[calc(100vh-80px)] flex-col gap-4">
          <section className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Deployment Control Center setup
            </p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  Repository를 단계별로 연결하세요.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  owner를 먼저 입력하고 GitHub API에서 실제 repository 목록을
                  불러온 뒤, branch와 deploy target URL을 분리해서 설정합니다.
                </p>
              </div>
              {repositories.length === 0 && getDefaultRepositoryConfig() ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  env 기반 기본 설정을 감지했습니다.
                </p>
              ) : null}
            </div>
          </section>
          <RepositorySetupPanel
            initialConfig={editingRepository}
            onCancel={
              repositories.length > 0
                ? () => {
                    setEditingRepository(null)
                    setIsEditingRepository(false)
                  }
                : undefined
            }
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
      <div className="flex min-h-[calc(100vh-76px)] flex-col gap-3 xl:h-[calc(100vh-76px)] xl:overflow-hidden">
        <section className="flex shrink-0 flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-md dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Active repository
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                {activeRepository
                  ? `${activeRepository.owner}/${activeRepository.repo}`
                  : 'Repository not selected'}
              </h1>
              {activeRepository ? (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {activeRepository.branch}
                </span>
              ) : null}
              {isWatchingLatestRun ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  LIVE
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Latest run
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-950 dark:text-white">
                {getRunStatusLabel(latestRun)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Last updated
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-950 dark:text-white">
                {formatLastUpdatedAt(workflowRunsQuery.dataUpdatedAt)}
              </p>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
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
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[240px_minmax(0,1fr)] xl:overflow-hidden">
          <aside className="flex min-h-0 flex-col gap-3 overflow-hidden">
            <div className="shrink-0">
              <MultiProjectOverview compact items={repositoryLatestRunStates} />
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <RepositoryList
                activeRepositoryId={activeRepositoryId}
                items={repositoryLatestRunStates}
                onRemoveRepository={removeRepository}
                onSelectRepository={setActiveRepository}
              />
            </div>
            <button
              className="shrink-0 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
              onClick={() => {
                setEditingRepository(null)
                setIsEditingRepository(true)
              }}
              type="button"
            >
              + Add project
            </button>
          </aside>

          <div className="grid min-h-[700px] gap-3 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:overflow-hidden">
            {/* 왼쪽: Pipeline Dependency Graph */}
            <div className="min-h-0">
              {activeRepository && workflowRunsQuery.isLoading ? (
                <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                  <Loader2
                    aria-hidden="true"
                    className="h-8 w-8 animate-spin text-slate-400"
                  />
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Loading
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    GitHub Actions workflow runs를 조회하고 있습니다.
                  </h2>
                </section>
              ) : null}

              {activeRepository && workflowRunsQuery.isError ? (
                <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm dark:border-red-800/60 dark:bg-red-950/40">
                  <AlertTriangle
                    aria-hidden="true"
                    className="h-8 w-8 text-red-500 dark:text-red-400"
                  />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                    API error
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-red-950 dark:text-red-100">
                    실제 workflow runs를 가져오지 못했습니다.
                  </h2>
                  {isGitHubApiError(workflowRunsQuery.error) ? (
                    <>
                      <p className="mx-auto mt-3 max-w-md text-sm font-medium text-red-800 dark:text-red-300">
                        {workflowRunsQuery.error.status.toString()} ·{' '}
                        {workflowRunsQuery.error.message}
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700 dark:text-red-400">
                        {getErrorHelp(workflowRunsQuery.error)}
                      </p>
                    </>
                  ) : (
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-700 dark:text-red-400">
                      알 수 없는 오류가 발생했습니다.
                    </p>
                  )}
                </section>
              ) : null}

              {activeRepository &&
              workflowRunsQuery.isSuccess &&
              runs.length === 0 ? (
                <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    데이터 없음
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Workflow run 데이터가 없습니다.
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
                    GitHub Actions API가 반환한 workflow run이 없습니다.
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

              {!activeRepository ? (
                <section className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Pipeline
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Repository를 선택하세요
                  </h2>
                </section>
              ) : null}
            </div>

            {/* 오른쪽: 탭 + 패널 콘텐츠 */}
            <section className="flowship-rise flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
              <div className="flex shrink-0 gap-1 border-b border-slate-100 p-2 dark:border-slate-800">
                {DASHBOARD_PANELS.map((panel) => {
                  const isSelected = selectedPanel === panel.id

                  return (
                    <button
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition duration-150 ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                      key={panel.id}
                      onClick={() => setSelectedPanel(panel.id)}
                      type="button"
                    >
                      {panel.label}
                    </button>
                  )
                })}
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-3">
                {activeRepository && workflowRunsQuery.isSuccess && latestRun ? (
                  <>
                    {selectedPanel === 'diagnosis' ? (
                      <FailureDiagnosisPanel
                        isLoading={workflowJobsQuery.isLoading}
                        jobs={jobs}
                      />
                    ) : null}

                    {selectedPanel === 'health' ? (
                      <DeploymentHealthPanel
                        config={activeRepository}
                        healthResults={deployTargetHealthQuery.data ?? []}
                        isLoading={deployTargetHealthQuery.isLoading}
                        latestRun={latestRun}
                      />
                    ) : null}

                    {selectedPanel === 'runs' ? (
                      <div className="space-y-3">
                        <WorkflowMetrics runs={runs} />
                        <WorkflowRunSummary run={selectedRun ?? latestRun} />
                        <WorkflowRunTable
                          onSelectRun={setSelectedRunId}
                          runs={runs}
                          selectedRunId={selectedRun?.id ?? null}
                        />
                      </div>
                    ) : null}

                    {selectedPanel === 'jobs' && workflowJobsQuery.isError ? (
                      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800/60 dark:bg-red-950/40">
                        <AlertTriangle
                          aria-hidden="true"
                          className="mx-auto h-8 w-8 text-red-500 dark:text-red-400"
                        />
                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-red-950 dark:text-red-200">
                          선택된 run의 jobs를 가져오지 못했습니다.
                        </h2>
                      </div>
                    ) : null}

                    {selectedPanel === 'jobs' && !workflowJobsQuery.isError ? (
                      <div className="space-y-3">
                        <WorkflowJobTimeline
                          isLoading={workflowJobsQuery.isLoading}
                          jobs={jobs}
                        />
                        {workflowJobsQuery.isSuccess ? (
                          <FailureDetails jobs={jobs} />
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    workflow run이 있으면 여기에 표시됩니다.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

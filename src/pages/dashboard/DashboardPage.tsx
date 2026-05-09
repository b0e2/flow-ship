import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { AppShell } from '../../shared/components/layout/AppShell'
import { DeploymentHealthPanel } from '../../features/github-actions/components/DeploymentHealthPanel'
import { FailureDetails } from '../../features/github-actions/components/FailureDetails'
import { PipelineVisualizer } from '../../features/github-actions/components/PipelineVisualizer'
import { WorkflowJobTimeline } from '../../features/github-actions/components/WorkflowJobTimeline'
import { WorkflowMetrics } from '../../features/github-actions/components/WorkflowMetrics'
import { WorkflowRunSummary } from '../../features/github-actions/components/WorkflowRunSummary'
import { WorkflowRunTable } from '../../features/github-actions/components/WorkflowRunTable'
import { useDeployTargetHealth } from '../../features/github-actions/hooks/useDeployTargetHealth'
import { useWorkflowJobs } from '../../features/github-actions/hooks/useWorkflowJobs'
import { useWorkflowRuns } from '../../features/github-actions/hooks/useWorkflowRuns'
import type { GitHubApiError } from '../../features/github-actions/model/githubActions.types'
import { useGitHubActionsUiStore } from '../../features/github-actions/store/githubActionsUiStore'
import {
  findLatestRun,
  isRunningWorkflowStatus,
} from '../../features/github-actions/utils/githubActionsUtils'
import { RepositoryConnectionSummary } from '../../features/repository/components/RepositoryConnectionSummary'
import { RepositorySetupPanel } from '../../features/repository/components/RepositorySetupPanel'
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

function getLatestRunStatusLabel(
  status: string | undefined,
  conclusion: string | null | undefined,
) {
  if (!status) {
    return '데이터 없음'
  }

  return status === 'completed' ? (conclusion ?? 'completed') : status
}

export function DashboardPage() {
  const config = useRepositoryConfigStore((state) => state.config)
  const hasHydratedRepositoryConfig = useRepositoryConfigStore(
    (state) => state.hasHydrated,
  )
  const setConfig = useRepositoryConfigStore((state) => state.setConfig)
  const selectedRunId = useGitHubActionsUiStore((state) => state.selectedRunId)
  const setSelectedRunId = useGitHubActionsUiStore(
    (state) => state.setSelectedRunId,
  )
  const [isEditingConfig, setIsEditingConfig] = useState(false)
  const hasAttemptedDefaultBootstrap = useRef(false)
  const shouldShowSetup = !config || isEditingConfig
  const workflowRunsQuery = useWorkflowRuns(config)
  const deployTargetHealthQuery = useDeployTargetHealth(config)
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
  const workflowJobsQuery = useWorkflowJobs(config, selectedRun?.id ?? null)
  const jobs = workflowJobsQuery.data?.jobs ?? []

  useEffect(() => {
    if (
      !hasHydratedRepositoryConfig ||
      hasAttemptedDefaultBootstrap.current ||
      config ||
      isEditingConfig
    ) {
      return
    }

    hasAttemptedDefaultBootstrap.current = true

    const defaultConfig = getDefaultRepositoryConfig()

    if (defaultConfig) {
      setConfig(defaultConfig)
    }
  }, [config, hasHydratedRepositoryConfig, isEditingConfig, setConfig])

  useEffect(() => {
    const hasSelectedRun = runs.some((run) => run.id === selectedRunId)

    if ((!selectedRunId || !hasSelectedRun) && latestRun) {
      setSelectedRunId(latestRun.id)
    }
  }, [latestRun, runs, selectedRunId, setSelectedRunId])

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                FlowShip
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Pipeline command center
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                GitHub Actions 기반 배포 파이프라인의 현재 상태를 실제 workflow
                run, jobs, steps 데이터로 관측합니다.
              </p>
            </div>

            {config && !shouldShowSetup ? (
              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Repository
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-950">
                    {config.owner}/{config.repo}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {config.branch}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Latest run
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {getLatestRunStatusLabel(
                      latestRun?.status,
                      latestRun?.conclusion,
                    )}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {latestRun?.head_sha.slice(0, 7) ?? '데이터 없음'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Live watch
                  </p>
                  <p
                    className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isWatchingLatestRun
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isWatchingLatestRun ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    ) : null}
                    {isWatchingLatestRun ? 'LIVE' : 'Idle'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {formatLastUpdatedAt(workflowRunsQuery.dataUpdatedAt)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {config && !shouldShowSetup ? (
          <RepositoryConnectionSummary
            config={config}
            onChangeRepository={() => setIsEditingConfig(true)}
          />
        ) : null}

        {shouldShowSetup ? (
          <>
            {!config && getDefaultRepositoryConfig() ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">
                  기본 repository 설정을 준비했습니다.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Vite env 설정이 감지되면 앱 시작 시 자동으로 연결하고 실제
                  GitHub Actions 데이터를 조회합니다.
                </p>
              </section>
            ) : null}
            <RepositorySetupPanel
              initialConfig={config}
              onSaved={() => setIsEditingConfig(false)}
            />
          </>
        ) : null}

        {config && !shouldShowSetup && workflowRunsQuery.isLoading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2
              aria-hidden="true"
              className="mx-auto h-8 w-8 animate-spin text-slate-400"
            />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Loading
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              GitHub Actions workflow runs를 조회하고 있습니다.
            </h2>
          </section>
        ) : null}

        {config && !shouldShowSetup && workflowRunsQuery.isError ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
            <AlertTriangle
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-red-500"
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

        {config &&
        !shouldShowSetup &&
        workflowRunsQuery.isSuccess &&
        runs.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              데이터 없음
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              아직 workflow run이 없습니다.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              현재 설정된 repository와 branch에서 GitHub Actions API가 반환한
              workflow run이 없습니다. FlowShip은 임의의 deployment history를
              표시하지 않습니다.
            </p>
          </section>
        ) : null}

        {config &&
        !shouldShowSetup &&
        workflowRunsQuery.isSuccess &&
        latestRun ? (
          <>
            <PipelineVisualizer
              isLoading={workflowJobsQuery.isLoading}
              jobs={jobs}
              run={selectedRun ?? latestRun}
            />
            <WorkflowMetrics compact runs={runs} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <div className="space-y-5">
                <WorkflowRunSummary run={selectedRun ?? latestRun} />
                <WorkflowRunTable
                  onSelectRun={setSelectedRunId}
                  runs={runs}
                  selectedRunId={selectedRun?.id ?? null}
                />
              </div>
              <div className="space-y-5">
                <DeploymentHealthPanel
                  config={config}
                  healthResults={deployTargetHealthQuery.data ?? []}
                  isLoading={deployTargetHealthQuery.isLoading}
                  latestRun={latestRun}
                />
                {workflowJobsQuery.isError ? (
                  <section className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
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
          </>
        ) : null}
      </div>
    </AppShell>
  )
}

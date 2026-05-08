import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { AppShell } from '../../shared/components/layout/AppShell'
import { WorkflowMetrics } from '../../features/github-actions/components/WorkflowMetrics'
import { WorkflowRunSummary } from '../../features/github-actions/components/WorkflowRunSummary'
import { WorkflowRunTable } from '../../features/github-actions/components/WorkflowRunTable'
import { useWorkflowRuns } from '../../features/github-actions/hooks/useWorkflowRuns'
import type { GitHubApiError } from '../../features/github-actions/model/githubActions.types'
import { findLatestRun } from '../../features/github-actions/utils/githubActionsUtils'
import { RepositoryConnectionSummary } from '../../features/repository/components/RepositoryConnectionSummary'
import { RepositorySetupPanel } from '../../features/repository/components/RepositorySetupPanel'
import { useRepositoryConfigStore } from '../../features/repository/store/repositoryConfigStore'

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

export function DashboardPage() {
  const config = useRepositoryConfigStore((state) => state.config)
  const [isEditingConfig, setIsEditingConfig] = useState(false)
  const shouldShowSetup = !config || isEditingConfig
  const workflowRunsQuery = useWorkflowRuns(config)
  const runs = workflowRunsQuery.data?.workflow_runs ?? []
  const latestRun = findLatestRun(runs)

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              FlowShip
            </h1>
            <p className="mt-4 max-w-2xl text-xl font-medium text-slate-700">
              Ship faster with visible deployment flow.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              GitHub Actions 기반 배포 파이프라인의 상태와 안정성을 한눈에
              확인하는 대시보드입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observability scope
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Actions · S3 · Amplify · Vite
            </p>
          </div>
        </section>

        {shouldShowSetup ? (
          <RepositorySetupPanel
            initialConfig={config}
            onSaved={() => setIsEditingConfig(false)}
          />
        ) : (
          <RepositoryConnectionSummary
            config={config}
            onChangeRepository={() => setIsEditingConfig(true)}
          />
        )}

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
            <WorkflowMetrics runs={runs} />
            <WorkflowRunSummary run={latestRun} />
            <WorkflowRunTable runs={runs} />
          </>
        ) : null}
      </div>
    </AppShell>
  )
}

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Loader2,
  XCircle,
} from 'lucide-react'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import type { WorkflowRun } from '../model/githubActions.types'
import type {
  DeployTargetHealthResult,
  DeployTargetHealthStatus,
} from '../api/deployTargetHealthApi'
import { formatWorkflowStatus } from '../utils/githubActionsUtils'

type DeploymentHealthPanelProps = {
  config: RepositoryConfig
  latestRun: WorkflowRun | null
  healthResults: DeployTargetHealthResult[]
  isLoading: boolean
}

function getStatusIcon(status: DeployTargetHealthStatus) {
  if (status === 'reachable') {
    return <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'unreachable') {
    return <XCircle aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'cors_blocked') {
    return <AlertTriangle aria-hidden="true" className="h-5 w-5" />
  }

  if (status === 'checking') {
    return <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
  }

  return <HelpCircle aria-hidden="true" className="h-5 w-5" />
}

function getStatusClassName(status: DeployTargetHealthStatus) {
  if (status === 'reachable') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  }

  if (status === 'unreachable') {
    return 'border-red-200 bg-red-50 text-red-900'
  }

  if (status === 'cors_blocked') {
    return 'border-amber-200 bg-amber-50 text-amber-900'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function getRunDeploymentMessage(latestRun: WorkflowRun | null) {
  if (!latestRun) {
    return 'latest workflow run 데이터가 없습니다.'
  }

  if (latestRun.status !== 'completed') {
    return `latest workflow run 상태: ${formatWorkflowStatus(
      latestRun.status,
      latestRun.conclusion,
    )}`
  }

  if (latestRun.conclusion === 'success') {
    return 'latest deployment succeeded'
  }

  if (latestRun.conclusion === 'failure') {
    return 'deployment failed'
  }

  return `latest workflow run 결론: ${latestRun.conclusion ?? '데이터 없음'}`
}

function DeployTargetCard({ result }: { result: DeployTargetHealthResult }) {
  const label = result.kind === 's3' ? 'S3 Website URL' : 'Amplify URL'

  return (
    <article
      className={`rounded-2xl border p-4 ${getStatusClassName(result.status)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-2 text-sm opacity-80">{result.message}</p>
        </div>
        {getStatusIcon(result.status)}
      </div>

      {result.url ? (
        <a
          className="mt-4 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold hover:underline"
          href={result.url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="truncate">{result.url}</span>
          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
        </a>
      ) : (
        <p className="mt-4 text-sm font-medium opacity-70">설정된 URL 없음</p>
      )}
    </article>
  )
}

export function DeploymentHealthPanel({
  config,
  latestRun,
  healthResults,
  isLoading,
}: DeploymentHealthPanelProps) {
  const fallbackResults: DeployTargetHealthResult[] = [
    {
      kind: 's3',
      url: config.s3WebsiteUrl ?? null,
      status: isLoading ? 'checking' : 'not_configured',
      message: isLoading
        ? 'URL 상태를 확인하고 있습니다.'
        : 'URL이 설정되지 않았습니다.',
    },
    {
      kind: 'amplify',
      url: config.amplifyUrl ?? null,
      status: isLoading ? 'checking' : 'not_configured',
      message: isLoading
        ? 'URL 상태를 확인하고 있습니다.'
        : 'URL이 설정되지 않았습니다.',
    },
  ]
  const results = healthResults.length > 0 ? healthResults : fallbackResults

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Deployment health
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Deploy target status
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            S3/Amplify URL만 확인합니다. 브라우저 CORS 정책으로 직접 확인할 수
            없으면 링크로 열어 검증하세요.
          </p>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
          {getRunDeploymentMessage(latestRun)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {results.map((result) => (
          <DeployTargetCard key={result.kind} result={result} />
        ))}
      </div>
    </section>
  )
}

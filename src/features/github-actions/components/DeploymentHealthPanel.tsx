import {
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

function StatusIcon({ status }: { status: DeployTargetHealthStatus }) {
  if (status === 'reachable') return <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
  if (status === 'unreachable') return <XCircle aria-hidden="true" className="h-5 w-5" />
  if (status === 'checking') return <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
  return <HelpCircle aria-hidden="true" className="h-5 w-5" />
}

function getCardStyle(status: DeployTargetHealthStatus) {
  if (status === 'reachable') {
    return {
      card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      accent: 'bg-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
      sub: 'text-emerald-700/80 dark:text-emerald-300/70',
    }
  }
  if (status === 'unreachable') {
    return {
      card: 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'bg-red-400',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      sub: 'text-red-700/80 dark:text-red-300/70',
    }
  }
  if (status === 'checking') {
    return {
      card: 'border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/30',
      icon: 'text-blue-500 dark:text-blue-400',
      accent: 'bg-blue-400',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      sub: 'text-blue-700/80 dark:text-blue-300/70',
    }
  }
  return {
    card: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40',
    icon: 'text-slate-400 dark:text-slate-500',
    accent: 'bg-slate-300 dark:bg-slate-600',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    text: 'text-slate-700 dark:text-slate-300',
    sub: 'text-slate-500 dark:text-slate-400',
  }
}

function getRunMessage(latestRun: WorkflowRun | null) {
  if (!latestRun) return 'latest run 데이터 없음'
  if (latestRun.status !== 'completed') {
    return formatWorkflowStatus(latestRun.status, latestRun.conclusion)
  }
  if (latestRun.conclusion === 'success') return 'latest deployment 성공'
  if (latestRun.conclusion === 'failure') return 'latest deployment 실패'
  return latestRun.conclusion ?? '결론 없음'
}

function getRunBadgeStyle(latestRun: WorkflowRun | null) {
  if (!latestRun) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  if (latestRun.conclusion === 'success') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
  if (latestRun.conclusion === 'failure') return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
}

function DeployTargetCard({ result }: { result: DeployTargetHealthResult }) {
  const style = getCardStyle(result.status)
  const label = result.kind === 's3' ? 'S3 Website' : 'Amplify'
  const statusLabel =
    result.status === 'reachable' ? 'Reachable' :
    result.status === 'unreachable' ? 'Unreachable' :
    result.status === 'checking' ? 'Checking...' : 'Not configured'

  return (
    <article className={`relative overflow-hidden rounded-2xl border ${style.card}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
      <div className="px-4 py-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {label}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${style.text}`}>
                <span className={style.icon}>
                  <StatusIcon status={result.status} />
                </span>
                {statusLabel}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${style.badge}`}>
                {result.kind}
              </span>
            </div>
            <p className={`mt-1 text-xs font-medium ${style.sub}`}>
              {result.message}
            </p>
          </div>
        </div>

        {result.url ? (
          <a
            className={`mt-3 inline-flex max-w-full items-center gap-1.5 text-xs font-semibold hover:underline ${style.text}`}
            href={result.url}
            rel="noreferrer"
            target="_blank"
          >
            <span className="truncate">{result.url}</span>
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </a>
        ) : (
          <p className={`mt-3 text-xs font-medium opacity-50 ${style.text}`}>
            설정된 URL 없음
          </p>
        )}
      </div>
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
      message: isLoading ? 'URL 상태를 확인하고 있습니다.' : 'URL이 설정되지 않았습니다.',
    },
    {
      kind: 'amplify',
      url: config.amplifyUrl ?? null,
      status: isLoading ? 'checking' : 'not_configured',
      message: isLoading ? 'URL 상태를 확인하고 있습니다.' : 'URL이 설정되지 않았습니다.',
    },
  ]
  const results = healthResults.length > 0 ? healthResults : fallbackResults

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Deployment Health
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Deploy Target Status
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            no-cors HEAD 요청으로 서버 응답 여부를 확인합니다.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getRunBadgeStyle(latestRun)}`}>
          {getRunMessage(latestRun)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {results.map((result) => (
          <DeployTargetCard key={result.kind} result={result} />
        ))}
      </div>
    </section>
  )
}

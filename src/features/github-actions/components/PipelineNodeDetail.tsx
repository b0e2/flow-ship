import { ExternalLink } from 'lucide-react'
import type { PipelineNode } from '../model/pipeline.types'
import { formatDateTime, formatDuration } from '../utils/githubActionsUtils'

type PipelineNodeDetailProps = {
  node: PipelineNode
}

export function PipelineNodeDetail({ node }: PipelineNodeDetailProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Node detail
      </p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
        {node.name}
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-600">
        {node.jobName}
        {node.stepNumber ? ` · Step ${node.stepNumber.toString()}` : ''}
      </p>

      <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </dt>
          <dd className="mt-2 text-sm font-semibold text-slate-950">
            {node.status}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Duration
          </dt>
          <dd className="mt-2 text-sm font-semibold text-slate-950">
            {formatDuration(node.durationSeconds)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Started
          </dt>
          <dd className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(node.startedAt)}
          </dd>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Completed
          </dt>
          <dd className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(node.completedAt)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-xs leading-5 text-slate-600">
        GitHub Actions jobs/steps API는 step log 본문을 포함하지 않습니다. 이
        패널은 실제 job/step 메타데이터만 표시하며, 상세 로그는 GitHub Actions
        링크에서 확인합니다.
      </p>

      {node.htmlUrl ? (
        <a
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950 hover:underline"
          href={node.htmlUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open GitHub Actions detail
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      ) : null}
    </aside>
  )
}

import {
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { RepositoryConfig } from '../model/repository.types'
import { useRepositoryConfigStore } from '../store/repositoryConfigStore'

type RepositoryConnectionSummaryProps = {
  config: RepositoryConfig
  onChangeRepository: () => void
}

function DeployTargetLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
    </a>
  )
}

export function RepositoryConnectionSummary({
  config,
  onChangeRepository,
}: RepositoryConnectionSummaryProps) {
  const removeRepository = useRepositoryConfigStore(
    (state) => state.removeRepository,
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Connected repository
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <GitPullRequest
              aria-hidden="true"
              className="h-5 w-5 text-slate-500"
            />
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              {config.name}
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
              {config.owner}/{config.repo}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
              <GitBranch aria-hidden="true" className="h-4 w-4" />
              {config.branch}
            </span>
            {config.token ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
                Token configured
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                Public API mode
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:text-slate-950"
            onClick={onChangeRepository}
            type="button"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Change repository
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
            onClick={() => removeRepository(config.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>

      {config.s3WebsiteUrl || config.amplifyUrl ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {config.s3WebsiteUrl ? (
            <DeployTargetLink
              label="S3 Website URL"
              url={config.s3WebsiteUrl}
            />
          ) : null}
          {config.amplifyUrl ? (
            <DeployTargetLink label="Amplify URL" url={config.amplifyUrl} />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

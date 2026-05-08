import type { ReleaseNote } from '../model/deployment.types'

type ReleaseNotesProps = {
  releaseNotes: ReleaseNote[]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function ReleaseNotes({ releaseNotes }: ReleaseNotesProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Release notes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent production-facing changes.
        </p>
      </div>

      <div className="space-y-4">
        {releaseNotes.map((note, index) => (
          <div
            className={`rounded-2xl border p-4 ${
              index === 0
                ? 'border-blue-200 bg-blue-50/60'
                : 'border-slate-200 bg-white'
            }`}
            key={note.version}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{note.version}</p>
              {index === 0 ? (
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                  latest
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {formatDate(note.releasedAt)}
            </p>
            <ul className="mt-3 space-y-2">
              {note.changes.map((change) => (
                <li className="text-sm leading-6 text-slate-600" key={change}>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  )
}

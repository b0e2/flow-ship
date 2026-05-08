import { useState } from 'react'
import { Check } from 'lucide-react'

const checklistItems = [
  'GitHub Secrets 등록 확인',
  'npm run build 성공 여부 확인',
  'S3 bucket policy 확인',
  'AWS region 확인',
  'Amplify build setting 확인',
  'README 배포 URL 업데이트',
]

export function DeploymentChecklist() {
  const [checkedItems, setCheckedItems] = useState<string[]>([
    checklistItems[0],
    checklistItems[1],
  ])

  function toggleItem(item: string) {
    setCheckedItems((currentItems) =>
      currentItems.includes(item)
        ? currentItems.filter((currentItem) => currentItem !== item)
        : [...currentItems, item],
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Deployment checklist
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Release readiness items kept local to this widget.
        </p>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => {
          const isChecked = checkedItems.includes(item)

          return (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
              key={item}
            >
              <input
                checked={isChecked}
                className="sr-only"
                onChange={() => toggleItem(item)}
                type="checkbox"
              />
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                <Check aria-hidden="true" size={14} />
              </span>
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </label>
          )
        })}
      </div>
    </article>
  )
}

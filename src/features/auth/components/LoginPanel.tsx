import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

type LoginPanelProps = {
  onCreateAccount: () => void
}

export function LoginPanel({ onCreateAccount }: LoginPanelProps) {
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsSubmitting(true)
    setError(null)

    const result = await login(email, password)

    if (!result.ok) {
      setError(result.message ?? '로그인하지 못했습니다.')
    }

    setIsSubmitting(false)
  }

  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <LogIn aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Local Workspace Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        FlowShip에 로그인하세요.
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        이 계정은 frontend-only 데모용 local account입니다. 사용자별 repository
        설정을 이 브라우저의 localStorage에 분리 저장합니다.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => void handleLogin()}
          type="button"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
        <button
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
          onClick={onCreateAccount}
          type="button"
        >
          Create account
        </button>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

type SignupPanelProps = {
  onBackToLogin: () => void
}

export function SignupPanel({ onBackToLogin }: SignupPanelProps) {
  const signup = useAuthStore((state) => state.signup)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('password 확인 값이 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signup(email, displayName, password)
      if (!result.ok) {
        setError(result.message ?? '계정을 만들지 못했습니다.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '계정을 만들지 못했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <UserPlus aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Local Workspace Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        새 workspace account를 만드세요.
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        password는 SHA-256 hash로 저장하지만, frontend-only local auth는 운영
        서비스용 인증이 아닙니다.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Display name
          </span>
          <input
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400/20"
            onChange={(event) => setDisplayName(event.target.value)}
            type="text"
            value={displayName}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400/20"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400/20"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400/20"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
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
          onClick={() => void handleSignup()}
          type="button"
        >
          {isSubmitting ? 'Creating...' : 'Sign up'}
        </button>
        <button
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
          onClick={onBackToLogin}
          type="button"
        >
          Back to login
        </button>
      </div>
    </section>
  )
}

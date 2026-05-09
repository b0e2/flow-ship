import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { LoginPanel } from './LoginPanel'
import { SignupPanel } from './SignupPanel'
import { useAuthStore } from '../store/authStore'
import { useRepositoryConfigStore } from '../../repository/store/repositoryConfigStore'

type AuthGateProps = {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const session = useAuthStore((state) => state.session)
  const setStorageUser = useRepositoryConfigStore(
    (state) => state.setStorageUser,
  )
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    setStorageUser(session?.userId ?? null)
  }, [session?.userId, setStorageUser])

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-950">
        <div className="grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              FlowShip
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              여러 배포 파이프라인을 사용자별 workspace로 관리하세요.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Local Workspace Account는 브라우저 안에서 사용자별 repository
              설정을 분리하기 위한 데모용 흐름입니다. 실제 서비스에서는 backend
              auth와 GitHub OAuth 또는 proxy가 필요합니다.
            </p>
          </section>

          {mode === 'login' ? (
            <LoginPanel onCreateAccount={() => setMode('signup')} />
          ) : (
            <SignupPanel onBackToLogin={() => setMode('login')} />
          )}
        </div>
      </main>
    )
  }

  return <>{children}</>
}

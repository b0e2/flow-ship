import { LogOut, Trash2, UserCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import {
  removeRepositoryConfigForUser,
  useRepositoryConfigStore,
} from '../../repository/store/repositoryConfigStore'

export function UserMenu() {
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const setStorageUser = useRepositoryConfigStore(
    (state) => state.setStorageUser,
  )

  if (!session) {
    return null
  }

  const handleLogout = () => {
    logout()
    setStorageUser(null)
  }

  const handleDeleteAccount = () => {
    const shouldDelete = window.confirm(
      '이 local account와 이 사용자의 repository 설정을 삭제할까요?',
    )

    if (!shouldDelete) {
      return
    }

    removeRepositoryConfigForUser(session.userId)
    deleteAccount()
    setStorageUser(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
        <UserCircle aria-hidden="true" className="h-4 w-4" />
        <span>{session.displayName}</span>
      </div>
      <button
        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
        onClick={handleLogout}
        type="button"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        Logout
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300"
        onClick={handleDeleteAccount}
        type="button"
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        Delete
      </button>
    </div>
  )
}

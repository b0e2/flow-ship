import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResult, AuthSession, LocalUser } from '../model/auth.types'
import { hashPassword } from '../utils/passwordHash'

type AuthState = {
  users: LocalUser[]
  session: AuthSession | null
  signup: (
    email: string,
    displayName: string,
    password: string,
  ) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => void
  deleteAccount: () => void
}

function createUserId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `local-${Date.now().toString()}`
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      session: null,
      signup: async (email, displayName, password) => {
        const normalizedEmail = normalizeEmail(email)
        const trimmedName = displayName.trim()

        if (!normalizedEmail || !trimmedName || password.length < 8) {
          return {
            ok: false,
            message: '이름, 이메일, 8자 이상의 password를 입력해야 합니다.',
          }
        }

        const existingUser = get().users.find(
          (user) => user.email === normalizedEmail,
        )

        if (existingUser) {
          return {
            ok: false,
            message: '이미 등록된 local workspace account입니다.',
          }
        }

        const user: LocalUser = {
          id: createUserId(),
          email: normalizedEmail,
          displayName: trimmedName,
          passwordHash: await hashPassword(normalizedEmail, password),
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, user],
          session: {
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
          },
        }))

        return { ok: true }
      },
      login: async (email, password) => {
        const normalizedEmail = normalizeEmail(email)
        const user = get().users.find((item) => item.email === normalizedEmail)

        if (!user) {
          return {
            ok: false,
            message: '등록된 local workspace account를 찾지 못했습니다.',
          }
        }

        const passwordHash = await hashPassword(normalizedEmail, password)

        if (passwordHash !== user.passwordHash) {
          return {
            ok: false,
            message: '이메일 또는 password가 올바르지 않습니다.',
          }
        }

        set({
          session: {
            userId: user.id,
            email: user.email,
            displayName: user.displayName,
          },
        })

        return { ok: true }
      },
      logout: () => set({ session: null }),
      deleteAccount: () => {
        const session = get().session

        if (!session) {
          return
        }

        set((state) => ({
          users: state.users.filter((user) => user.id !== session.userId),
          session: null,
        }))
      },
    }),
    {
      name: 'flowship:local-auth',
      version: 1,
      partialize: (state) => ({
        users: state.users,
        session: state.session,
      }),
    },
  ),
)

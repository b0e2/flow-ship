export type LocalUser = {
  id: string
  email: string
  displayName: string
  passwordHash: string
  createdAt: string
}

export type AuthSession = {
  userId: string
  email: string
  displayName: string
}

export type AuthResult = {
  ok: boolean
  message?: string
}

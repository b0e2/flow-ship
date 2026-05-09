function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const payload = new TextEncoder().encode(`${normalizedEmail}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', payload)

  return toHex(hash)
}

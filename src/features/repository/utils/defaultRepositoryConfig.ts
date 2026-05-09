import type { RepositoryConfig } from '../model/repository.types'

function getOptionalEnvValue(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

export function getDefaultRepositoryConfig(): RepositoryConfig | null {
  const owner = getOptionalEnvValue(import.meta.env.VITE_DEFAULT_GITHUB_OWNER)
  const repo = getOptionalEnvValue(import.meta.env.VITE_DEFAULT_GITHUB_REPO)
  const branch =
    getOptionalEnvValue(import.meta.env.VITE_DEFAULT_GITHUB_BRANCH) ?? 'main'

  if (!owner || !repo) {
    return null
  }

  return {
    owner,
    repo,
    branch,
    s3WebsiteUrl: getOptionalEnvValue(import.meta.env.VITE_DEFAULT_S3_URL),
    amplifyUrl: getOptionalEnvValue(import.meta.env.VITE_DEFAULT_AMPLIFY_URL),
  }
}

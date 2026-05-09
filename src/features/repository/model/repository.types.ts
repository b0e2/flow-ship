export type RepositoryConfig = {
  id: string
  name: string
  owner: string
  repo: string
  branch: string
  token?: string
  s3WebsiteUrl?: string
  amplifyUrl?: string
}

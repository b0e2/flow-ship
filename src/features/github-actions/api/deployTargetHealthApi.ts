export type DeployTargetKind = 's3' | 'amplify'

export type DeployTargetHealthStatus =
  | 'not_configured'
  | 'checking'
  | 'reachable'
  | 'unreachable'
  | 'cors_blocked'

export type DeployTargetHealthResult = {
  kind: DeployTargetKind
  url: string | null
  status: DeployTargetHealthStatus
  statusCode?: number
  message: string
}

type DeployTargetHealthInput = {
  kind: DeployTargetKind
  url?: string
}

async function checkUrlHealth({
  kind,
  url,
}: DeployTargetHealthInput): Promise<DeployTargetHealthResult> {
  if (!url) {
    return {
      kind,
      url: null,
      status: 'not_configured',
      message: 'URL이 설정되지 않았습니다.',
    }
  }

  try {
    // no-cors bypasses CORS restrictions — resolves (opaque) if server responds,
    // throws TypeError if server is unreachable / DNS failure
    await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return {
      kind,
      url,
      status: 'reachable',
      message: '서버가 응답하고 있습니다.',
    }
  } catch {
    return {
      kind,
      url,
      status: 'unreachable',
      message: '서버에 연결할 수 없거나 DNS 오류가 발생했습니다.',
    }
  }
}

export async function getDeployTargetHealth(targets: {
  s3WebsiteUrl?: string
  amplifyUrl?: string
}) {
  return Promise.all([
    checkUrlHealth({ kind: 's3', url: targets.s3WebsiteUrl }),
    checkUrlHealth({ kind: 'amplify', url: targets.amplifyUrl }),
  ])
}

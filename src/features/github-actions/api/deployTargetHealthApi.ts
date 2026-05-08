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
    const headResponse = await fetch(url, { method: 'HEAD' })

    return {
      kind,
      url,
      status: headResponse.ok ? 'reachable' : 'unreachable',
      statusCode: headResponse.status,
      message: headResponse.ok
        ? '브라우저에서 URL 상태를 확인했습니다.'
        : `HTTP ${headResponse.status.toString()} 응답을 받았습니다.`,
    }
  } catch {
    try {
      const getResponse = await fetch(url)

      return {
        kind,
        url,
        status: getResponse.ok ? 'reachable' : 'unreachable',
        statusCode: getResponse.status,
        message: getResponse.ok
          ? '브라우저에서 URL 상태를 확인했습니다.'
          : `HTTP ${getResponse.status.toString()} 응답을 받았습니다.`,
      }
    } catch {
      return {
        kind,
        url,
        status: 'cors_blocked',
        message:
          'CORS 정책으로 브라우저에서 직접 확인할 수 없습니다. 링크로 직접 확인하세요.',
      }
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

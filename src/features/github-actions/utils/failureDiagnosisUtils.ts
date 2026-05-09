import type { WorkflowJob, WorkflowJobStep } from '../model/githubActions.types'
import type { FailureDiagnosis } from '../model/diagnosis.types'
import { isFailedConclusion } from './githubActionsUtils'

type FailedSource = {
  id: string
  name: string
  jobName: string
  conclusion: string | null
  githubUrl: string
}

function includesAnyKeyword(value: string, keywords: string[]) {
  const normalizedValue = value.toLowerCase()
  return keywords.some((keyword) => normalizedValue.includes(keyword))
}

function getFailedSources(jobs: WorkflowJob[]): FailedSource[] {
  return jobs.flatMap((job) => {
    const failedSteps = job.steps.filter((step) =>
      isFailedConclusion(step.conclusion),
    )

    if (failedSteps.length > 0) {
      return failedSteps.map((step: WorkflowJobStep) => ({
        id: `${job.id.toString()}-${step.number.toString()}`,
        name: step.name,
        jobName: job.name,
        conclusion: step.conclusion,
        githubUrl: job.html_url,
      }))
    }

    if (isFailedConclusion(job.conclusion)) {
      return [
        {
          id: job.id.toString(),
          name: job.name,
          jobName: job.name,
          conclusion: job.conclusion,
          githubUrl: job.html_url,
        },
      ]
    }

    return []
  })
}

function createDiagnosis(
  source: FailedSource,
  diagnosis: Omit<FailureDiagnosis, 'id' | 'detectedFrom' | 'githubUrl'>,
): FailureDiagnosis {
  return {
    ...diagnosis,
    id: `${diagnosis.relatedKeyword ?? 'unknown'}-${source.id}`,
    detectedFrom:
      source.name === source.jobName
        ? source.jobName
        : `${source.jobName} / ${source.name}`,
    githubUrl: source.githubUrl,
  }
}

export function diagnoseS3Failure(source: FailedSource) {
  const value = `${source.jobName} ${source.name}`

  if (!includesAnyKeyword(value, ['s3', 'aws', 'sync', 'upload', 'deploy'])) {
    return null
  }

  return createDiagnosis(source, {
    title: 'S3 deployment failed',
    severity: 'high',
    likelyCause:
      'S3 permission, bucket name, or temporary AWS Academy credentials may be invalid.',
    recommendedActions: [
      'Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN repository secrets.',
      'Check S3_BUCKET_NAME secret.',
      'If using AWS Academy, refresh credentials after starting the lab.',
      'If sync --delete fails, try cp --recursive or add s3:ListBucket permission.',
    ],
    relatedKeyword: 's3',
  })
}

export function diagnoseAmplifyFailure(source: FailedSource) {
  const value = `${source.jobName} ${source.name}`

  if (!includesAnyKeyword(value, ['amplify'])) {
    return null
  }

  return createDiagnosis(source, {
    title: 'Amplify deployment failed',
    severity: 'high',
    likelyCause:
      'Amplify deployment configuration, app id, branch, or hosting environment may be invalid.',
    recommendedActions: [
      'Check Amplify Hosting app and branch settings.',
      'Confirm build artifacts point to dist.',
      'Open the GitHub Actions detail and inspect the Amplify deployment step.',
    ],
    relatedKeyword: 'amplify',
  })
}

export function diagnoseBuildFailure(source: FailedSource) {
  const value = `${source.jobName} ${source.name}`

  if (!includesAnyKeyword(value, ['build', 'vite', 'npm run build'])) {
    return null
  }

  return createDiagnosis(source, {
    title: 'Production build failed',
    severity: 'high',
    likelyCause:
      'TypeScript, Vite, missing environment variables, or production build configuration may be failing.',
    recommendedActions: [
      'Run npm run build locally.',
      'Check TypeScript errors.',
      'Check missing Vite environment variables.',
    ],
    relatedKeyword: 'build',
  })
}

export function diagnoseSecretFailure(source: FailedSource) {
  const value = `${source.jobName} ${source.name}`

  if (
    !includesAnyKeyword(value, [
      'secret',
      'credential',
      'aws credentials',
      'configure aws',
    ])
  ) {
    return null
  }

  return createDiagnosis(source, {
    title: 'Credential configuration failed',
    severity: 'high',
    likelyCause:
      'GitHub repository secrets or temporary AWS credentials may be missing, expired, or scoped incorrectly.',
    recommendedActions: [
      'Verify repository secrets.',
      'Check AWS_SESSION_TOKEN for temporary credentials.',
      'Confirm AWS_REGION value.',
    ],
    relatedKeyword: 'secret',
  })
}

export function diagnoseInstallFailure(source: FailedSource) {
  const value = `${source.jobName} ${source.name}`

  if (!includesAnyKeyword(value, ['install', 'npm ci', 'dependencies'])) {
    return null
  }

  return createDiagnosis(source, {
    title: 'Dependency installation failed',
    severity: 'medium',
    likelyCause:
      'package-lock.json, dependency resolution, registry access, or Node.js version may be incompatible.',
    recommendedActions: [
      'Check package-lock.json.',
      'Run npm ci locally.',
      'Verify Node.js version.',
    ],
    relatedKeyword: 'install',
  })
}

function diagnoseUnknownFailure(source: FailedSource) {
  return createDiagnosis(source, {
    title: 'Workflow failed',
    severity: 'medium',
    likelyCause:
      'The workflow failed, but the failed job or step name does not match a known FlowShip diagnosis rule.',
    recommendedActions: [
      'Open GitHub Actions detail.',
      'Inspect failed job logs.',
      'Check recent workflow or dependency changes.',
    ],
    relatedKeyword: 'unknown',
  })
}

export function diagnoseFailureFromJobs(jobs: WorkflowJob[]) {
  const failedSources = getFailedSources(jobs)

  return failedSources.map((source) => {
    return (
      diagnoseSecretFailure(source) ??
      diagnoseS3Failure(source) ??
      diagnoseAmplifyFailure(source) ??
      diagnoseBuildFailure(source) ??
      diagnoseInstallFailure(source) ??
      diagnoseUnknownFailure(source)
    )
  })
}

export function getPrimaryDiagnosis(diagnoses: FailureDiagnosis[]) {
  return (
    diagnoses.find((diagnosis) => diagnosis.severity === 'high') ??
    diagnoses.find((diagnosis) => diagnosis.severity === 'medium') ??
    diagnoses[0] ??
    null
  )
}

export type FailureDiagnosisSeverity = 'low' | 'medium' | 'high'

export type FailureDiagnosis = {
  id: string
  title: string
  severity: FailureDiagnosisSeverity
  detectedFrom: string
  likelyCause: string
  recommendedActions: string[]
  relatedKeyword?: string
  githubUrl?: string
}

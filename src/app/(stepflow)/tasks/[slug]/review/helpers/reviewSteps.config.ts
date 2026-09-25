export const REVIEW_STEP_IDS = ['stars', 'comment', 'submit'] as const

export type ReviewStepId = (typeof REVIEW_STEP_IDS)[number]

export function reviewStepIndex(id: ReviewStepId): number {
  return REVIEW_STEP_IDS.indexOf(id)
}

export function reviewNextStep(id: ReviewStepId): ReviewStepId | null {
  const index = reviewStepIndex(id)
  return REVIEW_STEP_IDS[index + 1] ?? null
}

export function reviewPreviousStep(id: ReviewStepId): ReviewStepId | null {
  const index = reviewStepIndex(id)
  return index > 0 ? (REVIEW_STEP_IDS[index - 1] ?? null) : null
}

export function reviewProgressPercent(id: ReviewStepId): number {
  const index = reviewStepIndex(id)
  if (index < 0) return 0
  return Math.round(((index + 1) / REVIEW_STEP_IDS.length) * 100)
}

/**
 * Quote flow structure: step ids, order and which steps are optional.
 * Labels, titles and descriptions live in `../i11n.json` under
 * `majorSteps.<id>` and `steps.<id>`, looked up by these ids.
 */
export type TaskQuoteSubStepId =
  | 'quote.price'
  | 'quote.message'
  | 'quote.availability'
  | 'quote.photos'
  | 'review.check'

export type TaskQuoteMajorStepId = 'quote' | 'review'

export type TaskQuoteSubStepConfig = {
  id: TaskQuoteSubStepId
  optional?: boolean
}

export type TaskQuoteMajorStepConfig = {
  id: TaskQuoteMajorStepId
  subSteps: TaskQuoteSubStepConfig[]
}

export const TASK_QUOTE_MAJOR_STEPS: TaskQuoteMajorStepConfig[] = [
  {
    id: 'quote',
    subSteps: [
      { id: 'quote.price' },
      { id: 'quote.message' },
      { id: 'quote.availability' },
      { id: 'quote.photos', optional: true },
    ],
  },
  {
    id: 'review',
    subSteps: [{ id: 'review.check' }],
  },
]

export const TASK_QUOTE_FLAT_STEPS: TaskQuoteSubStepConfig[] =
  TASK_QUOTE_MAJOR_STEPS.flatMap((major) => major.subSteps)

export const TASK_QUOTE_FIRST_SUB_STEP: TaskQuoteSubStepId =
  TASK_QUOTE_FLAT_STEPS[0]?.id ?? 'quote.price'

export function taskQuoteSubStepIndex(id: TaskQuoteSubStepId): number {
  return TASK_QUOTE_FLAT_STEPS.findIndex((step) => step.id === id)
}

export function taskQuoteSubStepConfig(
  id: TaskQuoteSubStepId,
): TaskQuoteSubStepConfig | undefined {
  return TASK_QUOTE_FLAT_STEPS.find((step) => step.id === id)
}

export function taskQuoteMajorIndexForSubStep(id: TaskQuoteSubStepId): number {
  for (let i = 0; i < TASK_QUOTE_MAJOR_STEPS.length; i += 1) {
    if (TASK_QUOTE_MAJOR_STEPS[i].subSteps.some((sub) => sub.id === id)) {
      return i
    }
  }
  return 0
}

export function taskQuoteProgressPercent(
  activeSubStep: TaskQuoteSubStepId,
): number {
  const index = taskQuoteSubStepIndex(activeSubStep)
  const total = TASK_QUOTE_FLAT_STEPS.length
  if (index < 0 || total <= 1) return 100
  return Math.round(((index + 1) / total) * 100)
}

/** Major step number (1-based) and how many major steps there are. */
export function taskQuoteStepPosition(activeSubStep: TaskQuoteSubStepId): {
  step: number
  total: number
} {
  return {
    step: taskQuoteMajorIndexForSubStep(activeSubStep) + 1,
    total: TASK_QUOTE_MAJOR_STEPS.length,
  }
}

export function taskQuotePreviousSubStep(
  id: TaskQuoteSubStepId,
): TaskQuoteSubStepId | null {
  const index = taskQuoteSubStepIndex(id)
  if (index <= 0) return null
  return TASK_QUOTE_FLAT_STEPS[index - 1]?.id ?? null
}

export function taskQuoteNextSubStep(
  id: TaskQuoteSubStepId,
): TaskQuoteSubStepId | null {
  const index = taskQuoteSubStepIndex(id)
  if (index < 0 || index >= TASK_QUOTE_FLAT_STEPS.length - 1) return null
  return TASK_QUOTE_FLAT_STEPS[index + 1]?.id ?? null
}

export function taskQuoteIsSubStepUnlocked(
  id: TaskQuoteSubStepId,
  activeSubStep: TaskQuoteSubStepId,
  completedSubSteps: ReadonlySet<string>,
): boolean {
  if (completedSubSteps.has(id)) return true
  if (id === activeSubStep) return true

  const targetIndex = taskQuoteSubStepIndex(id)
  if (targetIndex < 0) return false

  for (let i = 0; i < targetIndex; i += 1) {
    const step = TASK_QUOTE_FLAT_STEPS[i]
    if (!step) continue
    if (step.optional) continue
    if (!completedSubSteps.has(step.id)) return false
  }

  return true
}

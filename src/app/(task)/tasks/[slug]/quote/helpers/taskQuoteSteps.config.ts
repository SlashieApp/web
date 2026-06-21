export type TaskQuoteSubStepId =
  | 'quote.price'
  | 'quote.message'
  | 'quote.availability'
  | 'quote.photos'
  | 'review.check'

export type TaskQuoteMajorStepId = 'quote' | 'review'

export type TaskQuoteSubStepConfig = {
  id: TaskQuoteSubStepId
  label: string
  optional?: boolean
}

export type TaskQuoteMajorStepConfig = {
  id: TaskQuoteMajorStepId
  label: string
  subSteps: TaskQuoteSubStepConfig[]
}

export const TASK_QUOTE_MAJOR_STEPS: TaskQuoteMajorStepConfig[] = [
  {
    id: 'quote',
    label: 'Your quote',
    subSteps: [
      { id: 'quote.price', label: 'Your price' },
      { id: 'quote.message', label: 'Message' },
      { id: 'quote.availability', label: 'Availability' },
      { id: 'quote.photos', label: 'Photos', optional: true },
    ],
  },
  {
    id: 'review',
    label: 'Review & send',
    subSteps: [{ id: 'review.check', label: 'Review' }],
  },
]

export const TASK_QUOTE_FLAT_STEPS: TaskQuoteSubStepConfig[] =
  TASK_QUOTE_MAJOR_STEPS.flatMap((major) => major.subSteps)

export const TASK_QUOTE_FIRST_SUB_STEP: TaskQuoteSubStepId =
  TASK_QUOTE_FLAT_STEPS[0]?.id ?? 'quote.price'

export const TASK_QUOTE_STEP_COPY: Record<
  TaskQuoteSubStepId,
  { title: string; description?: string }
> = {
  'quote.price': {
    title: 'Your price',
    description:
      'Enter the total price you would like to charge for this task.',
  },
  'quote.message': {
    title: 'Message to customer',
    description:
      'Introduce yourself and explain how you will complete the job.',
  },
  'quote.availability': {
    title: 'When can you do the work?',
    description: 'Let the customer know when you are available.',
  },
  'quote.photos': {
    title: 'Add photos',
    description:
      'Optional — add photos of your previous work. Uploads are not sent with the quote yet.',
  },
  'review.check': {
    title: 'Review your quote',
    description:
      'Check your details before sending your quote to the customer.',
  },
}

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

export function taskQuoteStepCaption(
  activeSubStep: TaskQuoteSubStepId,
): string {
  const majorIndex = taskQuoteMajorIndexForSubStep(activeSubStep)
  const sub = taskQuoteSubStepConfig(activeSubStep)
  return `Step ${majorIndex + 1} of ${TASK_QUOTE_MAJOR_STEPS.length} · ${sub?.label ?? activeSubStep}`
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

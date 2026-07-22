import type { StepperStep } from '@ui'

import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'

/**
 * Task-creation step model for the shared StepFlowLayout. Mirrors the quote
 * flow's config shape: major steps (stepper rail) → flat sub-steps (screens),
 * plus per-step copy, per-step form fields (react-hook-form `trigger` scope),
 * and pure navigation helpers.
 */

export type CreateTaskSubStepId =
  | 'details.basics'
  | 'details.location'
  | 'details.timing'
  | 'publish.photos'
  | 'publish.budget'
  | 'publish.contact'

type CreateTaskSubStep = {
  id: CreateTaskSubStepId
  label: string
  optional?: boolean
}

type CreateTaskMajorStep = {
  id: string
  label: string
  subSteps: CreateTaskSubStep[]
}

export const CREATE_TASK_MAJOR_STEPS: CreateTaskMajorStep[] = [
  {
    id: 'details',
    label: 'Task details',
    subSteps: [
      { id: 'details.basics', label: 'Basics' },
      { id: 'details.location', label: 'Location' },
      { id: 'details.timing', label: 'Timing' },
    ],
  },
  {
    id: 'publish',
    label: 'Budget & publish',
    subSteps: [
      { id: 'publish.photos', label: 'Photos', optional: true },
      { id: 'publish.budget', label: 'Budget & payment' },
      { id: 'publish.contact', label: 'Contact & publish' },
    ],
  },
]

/** Rail shape for the shared @ui Stepper. */
export const CREATE_TASK_STEPPER_STEPS: StepperStep[] =
  CREATE_TASK_MAJOR_STEPS.map((major) => ({
    id: major.id,
    label: major.label,
    subSteps: major.subSteps.map(({ id, label }) => ({ id, label })),
  }))

const FLAT_STEPS: CreateTaskSubStep[] = CREATE_TASK_MAJOR_STEPS.flatMap(
  (major) => major.subSteps,
)

export const CREATE_TASK_FIRST_SUB_STEP: CreateTaskSubStepId = 'details.basics'

export const CREATE_TASK_FINAL_SUB_STEP: CreateTaskSubStepId = 'publish.contact'

export const CREATE_TASK_STEP_COPY: Record<
  CreateTaskSubStepId,
  { title: string; description?: string }
> = {
  'details.basics': {
    title: 'What needs doing?',
    description: 'Give your task a clear title, category, and description.',
  },
  'details.location': {
    title: 'Where is the task?',
    description:
      'Drop a pin so nearby workers can find it. Your exact address is only shared with the worker you accept.',
  },
  'details.timing': {
    title: 'When do you need it?',
    description:
      'Keep it flexible or set a date — you agree final timing with your worker.',
  },
  'publish.photos': {
    title: 'Add photos',
    description: 'Optional, but tasks with photos get better quotes.',
  },
  'publish.budget': {
    title: 'Set your budget',
    description:
      'A realistic budget helps workers quote accurately. You pay the worker directly.',
  },
  'publish.contact': {
    title: 'How should workers reach you?',
    description:
      'Choose how your accepted worker can contact you, then publish your task.',
  },
}

/** Form fields validated (react-hook-form `trigger`) before leaving a step. */
export const CREATE_TASK_STEP_FIELDS: Record<
  CreateTaskSubStepId,
  Array<keyof CreateTaskFormFieldValues>
> = {
  'details.basics': ['title', 'category', 'description'],
  'details.location': [
    'mapPlaceName',
    'locationLat',
    'locationLng',
    'streetAddress',
  ],
  'details.timing': ['datetimeType', 'preferredDate', 'preferredTime'],
  'publish.photos': [],
  'publish.budget': [
    'budgetMajor',
    'budgetCurrency',
    'budgetType',
    'paymentMethod',
  ],
  'publish.contact': ['preferredContactMethod'],
}

export function createTaskSubStepIndex(id: CreateTaskSubStepId): number {
  return FLAT_STEPS.findIndex((step) => step.id === id)
}

export function createTaskNextSubStep(
  id: CreateTaskSubStepId,
): CreateTaskSubStepId | null {
  const index = createTaskSubStepIndex(id)
  return FLAT_STEPS[index + 1]?.id ?? null
}

export function createTaskPreviousSubStep(
  id: CreateTaskSubStepId,
): CreateTaskSubStepId | null {
  const index = createTaskSubStepIndex(id)
  return FLAT_STEPS[index - 1]?.id ?? null
}

export function createTaskProgressPercent(id: CreateTaskSubStepId): number {
  return Math.round(
    ((createTaskSubStepIndex(id) + 1) / FLAT_STEPS.length) * 100,
  )
}

export function createTaskStepCaption(id: CreateTaskSubStepId): string {
  const index = createTaskSubStepIndex(id)
  const label = FLAT_STEPS[index]?.label ?? ''
  return `Step ${index + 1} of ${FLAT_STEPS.length} · ${label}`
}

/** Unlocked when completed, active, or every prior required step is complete. */
export function createTaskIsSubStepUnlocked(
  id: CreateTaskSubStepId,
  activeSubStep: CreateTaskSubStepId,
  completedSubSteps: ReadonlySet<string>,
): boolean {
  if (id === activeSubStep || completedSubSteps.has(id)) return true
  const targetIndex = createTaskSubStepIndex(id)
  return FLAT_STEPS.slice(0, targetIndex).every(
    (step) => step.optional || completedSubSteps.has(step.id),
  )
}

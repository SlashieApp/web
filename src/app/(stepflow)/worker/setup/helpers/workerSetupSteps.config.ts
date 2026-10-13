import { formatMessage } from '@/i18n/loadPageI11n'

export type WorkerSetupSubStepId =
  | 'profile.details'
  | 'profile.photo'
  | 'profile.bio'
  | 'services.skills'
  | 'services.experience'
  | 'area.location'
  | 'area.travel'
  | 'verify.phone'
  | 'verify.portfolio'
  | 'review.submit'

export type WorkerSetupMajorStepId =
  | 'profile'
  | 'services'
  | 'area'
  | 'verify'
  | 'review'

export type WorkerSetupSubStepConfig = {
  id: WorkerSetupSubStepId
  optional?: boolean
}

export type WorkerSetupMajorStepConfig = {
  id: WorkerSetupMajorStepId
  subSteps: WorkerSetupSubStepConfig[]
}

/** Step labels and captions live in the setup i11n bag. */
export type WorkerSetupStepLabels = {
  majors: Record<WorkerSetupMajorStepId, string>
  subSteps: Record<WorkerSetupSubStepId, string>
}

export const WORKER_SETUP_MAJOR_STEPS: WorkerSetupMajorStepConfig[] = [
  {
    id: 'profile',
    subSteps: [
      { id: 'profile.details' },
      { id: 'profile.photo' },
      { id: 'profile.bio' },
    ],
  },
  {
    id: 'services',
    subSteps: [{ id: 'services.skills' }, { id: 'services.experience' }],
  },
  {
    id: 'area',
    subSteps: [{ id: 'area.location' }, { id: 'area.travel', optional: true }],
  },
  {
    id: 'verify',
    subSteps: [
      { id: 'verify.phone' },
      { id: 'verify.portfolio', optional: true },
    ],
  },
  {
    id: 'review',
    subSteps: [{ id: 'review.submit' }],
  },
]

export const WORKER_SETUP_FLAT_STEPS: WorkerSetupSubStepConfig[] =
  WORKER_SETUP_MAJOR_STEPS.flatMap((major) => major.subSteps)

export const WORKER_SETUP_FIRST_SUB_STEP: WorkerSetupSubStepId =
  WORKER_SETUP_FLAT_STEPS[0]?.id ?? 'profile.details'

export function subStepIndex(id: WorkerSetupSubStepId): number {
  return WORKER_SETUP_FLAT_STEPS.findIndex((step) => step.id === id)
}

export function subStepConfig(
  id: WorkerSetupSubStepId,
): WorkerSetupSubStepConfig | undefined {
  return WORKER_SETUP_FLAT_STEPS.find((step) => step.id === id)
}

export function majorIndexForSubStep(id: WorkerSetupSubStepId): number {
  for (let i = 0; i < WORKER_SETUP_MAJOR_STEPS.length; i += 1) {
    if (WORKER_SETUP_MAJOR_STEPS[i].subSteps.some((sub) => sub.id === id)) {
      return i
    }
  }
  return 0
}

export function progressPercent(activeSubStep: WorkerSetupSubStepId): number {
  const index = subStepIndex(activeSubStep)
  const total = WORKER_SETUP_FLAT_STEPS.length
  if (index < 0 || total <= 1) return 100
  return Math.round(((index + 1) / total) * 100)
}

export function stepCaption(
  activeSubStep: WorkerSetupSubStepId,
  copy: WorkerSetupStepLabels & { progressCaption: string },
): string {
  return formatMessage(copy.progressCaption, {
    current: majorIndexForSubStep(activeSubStep) + 1,
    total: WORKER_SETUP_MAJOR_STEPS.length,
    label: copy.subSteps[activeSubStep],
  })
}

/** Steps with localised labels, for the Stepper and the phone accordion. */
export function workerSetupStepsWithLabels(copy: WorkerSetupStepLabels) {
  return WORKER_SETUP_MAJOR_STEPS.map((major) => ({
    ...major,
    label: copy.majors[major.id],
    subSteps: major.subSteps.map((sub) => ({
      ...sub,
      label: copy.subSteps[sub.id],
    })),
  }))
}

export function previousSubStep(
  id: WorkerSetupSubStepId,
): WorkerSetupSubStepId | null {
  const index = subStepIndex(id)
  if (index <= 0) return null
  return WORKER_SETUP_FLAT_STEPS[index - 1]?.id ?? null
}

export function isSubStepOptional(id: WorkerSetupSubStepId): boolean {
  return Boolean(subStepConfig(id)?.optional)
}

export function isSubStepUnlocked(
  id: WorkerSetupSubStepId,
  activeSubStep: WorkerSetupSubStepId,
  completedSubSteps: ReadonlySet<string>,
): boolean {
  if (completedSubSteps.has(id)) return true
  if (id === activeSubStep) return true

  const targetIndex = subStepIndex(id)
  if (targetIndex < 0) return false

  for (let i = 0; i < targetIndex; i += 1) {
    const step = WORKER_SETUP_FLAT_STEPS[i]
    if (!step) continue
    if (step.optional) continue
    if (!completedSubSteps.has(step.id)) return false
  }

  return true
}

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
  label: string
  optional?: boolean
}

export type WorkerSetupMajorStepConfig = {
  id: WorkerSetupMajorStepId
  label: string
  subSteps: WorkerSetupSubStepConfig[]
}

export const WORKER_SETUP_MAJOR_STEPS: WorkerSetupMajorStepConfig[] = [
  {
    id: 'profile',
    label: 'Build your profile',
    subSteps: [
      { id: 'profile.details', label: 'Personal details' },
      { id: 'profile.photo', label: 'Profile photo' },
      { id: 'profile.bio', label: 'Public bio' },
    ],
  },
  {
    id: 'services',
    label: 'Your services',
    subSteps: [
      { id: 'services.skills', label: 'Skills' },
      { id: 'services.experience', label: 'Experience' },
    ],
  },
  {
    id: 'area',
    label: 'Service area',
    subSteps: [
      { id: 'area.location', label: 'Location' },
      { id: 'area.travel', label: 'Travel', optional: true },
    ],
  },
  {
    id: 'verify',
    label: 'Verify & trust',
    subSteps: [
      { id: 'verify.phone', label: 'Phone' },
      { id: 'verify.portfolio', label: 'Portfolio', optional: true },
    ],
  },
  {
    id: 'review',
    label: 'Review & go',
    subSteps: [{ id: 'review.submit', label: 'Review' }],
  },
]

export const WORKER_SETUP_FLAT_STEPS: WorkerSetupSubStepConfig[] =
  WORKER_SETUP_MAJOR_STEPS.flatMap((major) => major.subSteps)

export const WORKER_SETUP_FIRST_SUB_STEP: WorkerSetupSubStepId =
  WORKER_SETUP_FLAT_STEPS[0]?.id ?? 'profile.details'

export const STEP_COPY: Record<
  WorkerSetupSubStepId,
  { title: string; description?: string }
> = {
  'profile.details': {
    title: 'Tell us about yourself',
    description:
      'This information appears on your public worker profile so customers can trust you before accepting your quote.',
  },
  'profile.photo': {
    title: 'Add a profile photo',
    description: 'A clear photo helps customers recognise you on quotes.',
  },
  'profile.bio': {
    title: 'Write your public bio',
    description: 'Keep it short and focused on the work you do best.',
  },
  'services.skills': {
    title: 'What services do you offer?',
    description: 'Help customers find you for the right kinds of tasks.',
  },
  'services.experience': {
    title: 'How much experience do you have?',
    description: 'Share how long you have been doing this work.',
  },
  'area.location': {
    title: 'Where do you work?',
    description: 'Add the city or area where you usually take on jobs.',
  },
  'area.travel': {
    title: 'Travel preferences',
    description: 'Optional — tell customers how far you are willing to travel.',
  },
  'verify.phone': {
    title: 'Verify your contact',
    description: 'Verified contact details build trust before you send quotes.',
  },
  'verify.portfolio': {
    title: 'Show your work',
    description: 'Optional — add notes about recent jobs or portfolio links.',
  },
  'review.submit': {
    title: 'Review and start quoting',
    description:
      'Check your details, then unlock quoting on tasks. Customers pay you directly for completed work.',
  },
}

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

export function stepCaption(activeSubStep: WorkerSetupSubStepId): string {
  const majorIndex = majorIndexForSubStep(activeSubStep)
  const major = WORKER_SETUP_MAJOR_STEPS[majorIndex]
  const sub = subStepConfig(activeSubStep)
  return `Step ${majorIndex + 1} of ${WORKER_SETUP_MAJOR_STEPS.length} · ${sub?.label ?? activeSubStep}`
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

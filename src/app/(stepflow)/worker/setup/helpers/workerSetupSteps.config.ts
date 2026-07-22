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
      { id: 'verify.phone', label: 'Contact' },
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
    title: 'Tell us your name',
    description:
      'Your name appears on your public profile and every quote you send — customers want to know who is turning up.',
  },
  'profile.photo': {
    title: 'Add a profile photo',
    description:
      'Profiles with a clear, friendly photo win more work — customers pick faces they recognise and trust.',
  },
  'profile.bio': {
    title: 'Write your headline and bio',
    description:
      'Customers read this before accepting your quote. A sharp headline and two or three sentences about the work you do best.',
  },
  'services.skills': {
    title: 'What work do you do?',
    description:
      'Your trade and skills become searchable tags — they decide which tasks you show up for.',
  },
  'services.experience': {
    title: 'How much experience do you have?',
    description:
      'Years of experience appear next to your rating — one of the first things customers compare.',
  },
  'area.location': {
    title: 'Where do you work?',
    description:
      'We only ever show customers an approximate area — never your address.',
  },
  'area.travel': {
    title: 'How far will you travel?',
    description:
      'Optional — a wider radius means more tasks in your search results.',
  },
  'verify.phone': {
    title: 'Verify your phone',
    description:
      'A verified phone number is required to send quotes — customers see a "Phone verified" badge on your profile.',
  },
  'verify.portfolio': {
    title: 'Show your work',
    description:
      'Optional, but workers with photos win more quotes — add pictures of finished jobs.',
  },
  'review.submit': {
    title: 'Your profile, as customers see it',
    description:
      'Check the preview below — this is exactly what customers see when they open your profile.',
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

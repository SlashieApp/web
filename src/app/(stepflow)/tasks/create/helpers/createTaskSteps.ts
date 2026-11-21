import { CREATE_TASK_STEPS, type CreateTaskStepId } from '../views'

const ORDER = CREATE_TASK_STEPS.map((view) => view.step)

export function createTaskNextStep(
  id: CreateTaskStepId,
): CreateTaskStepId | null {
  return ORDER[ORDER.indexOf(id) + 1] ?? null
}

export function createTaskPreviousStep(
  id: CreateTaskStepId,
): CreateTaskStepId | null {
  return ORDER[ORDER.indexOf(id) - 1] ?? null
}

/**
 * Which way a step change travels, for the side the next step slides in
 * from (Ryan 22 Nov): later in the flow is forward, earlier is back, and
 * staying put moves nothing.
 */
export function createTaskStepDirection(
  from: CreateTaskStepId,
  to: CreateTaskStepId,
): 'forward' | 'back' | null {
  const change = ORDER.indexOf(to) - ORDER.indexOf(from)
  if (change === 0) return null
  return change > 0 ? 'forward' : 'back'
}

/** 1-based position, for the progress strip ("Step 2 of 7"). */
export function createTaskProgress(id: CreateTaskStepId) {
  const index = ORDER.indexOf(id) + 1
  return {
    index,
    total: ORDER.length,
    percent: Math.round((index / ORDER.length) * 100),
  }
}

/** The earliest step that asks for one of the errored fields. */
export function createTaskFirstErroredStep(
  erroredFields: readonly string[],
): CreateTaskStepId | null {
  const view = CREATE_TASK_STEPS.find((step) =>
    step.fields.some((field) => erroredFields.includes(field)),
  )
  return view?.step ?? null
}

/** Open when it is the current step, done, or every step before it is done. */
export function createTaskIsStepUnlocked(
  id: CreateTaskStepId,
  active: CreateTaskStepId,
  done: ReadonlySet<CreateTaskStepId>,
): boolean {
  if (id === active || done.has(id)) return true
  return ORDER.slice(0, ORDER.indexOf(id)).every((step) => done.has(step))
}

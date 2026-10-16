import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'
import type { CreateTaskStepId } from '../views'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** The answers kept between visits; photos and the confirmation are not. */
export type CreateTaskDraftValues = Partial<
  Omit<CreateTaskFormFieldValues, 'acceptedProhibitedUse'>
>

export type CreateTaskDraft = {
  v: 1
  savedAt: number
  step: CreateTaskStepId
  done: CreateTaskStepId[]
  values: CreateTaskDraftValues
}

const DRAFT_MAX_AGE_MS = 7 * 86_400_000

/** One draft per account on this browser. */
export function createTaskDraftKey(userId: string): string {
  return `slashie:create-task-draft:${userId}`
}

function hasAnswers(values: Partial<CreateTaskFormFieldValues>): boolean {
  return Boolean(
    values.title?.trim() ||
      values.description?.trim() ||
      values.streetAddress?.trim() ||
      values.budgetMajor?.trim() ||
      (values.categories?.length ?? 0) > 0,
  )
}

export function readCreateTaskDraft(
  storage: StorageLike,
  key: string,
  now = Date.now(),
): CreateTaskDraft | null {
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const draft = JSON.parse(raw) as CreateTaskDraft
    if (draft?.v !== 1 || typeof draft.savedAt !== 'number') return null
    if (now - draft.savedAt > DRAFT_MAX_AGE_MS) return null
    if (!draft.values || typeof draft.values !== 'object') return null
    return draft
  } catch {
    return null
  }
}

/** Saves the answers, or clears the draft when there is nothing worth keeping. */
export function saveCreateTaskDraft(
  storage: StorageLike,
  key: string,
  input: {
    step: CreateTaskStepId
    done: CreateTaskStepId[]
    values: Partial<CreateTaskFormFieldValues>
  },
  now = Date.now(),
): void {
  try {
    if (!hasAnswers(input.values)) {
      storage.removeItem(key)
      return
    }
    const { acceptedProhibitedUse: _, ...values } = input.values
    const draft: CreateTaskDraft = {
      v: 1,
      savedAt: now,
      step: input.step,
      done: input.done,
      values,
    }
    storage.setItem(key, JSON.stringify(draft))
  } catch {
    // Private mode or a full quota: carry on without a draft.
  }
}

export function clearCreateTaskDraft(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // Nothing to clear.
  }
}

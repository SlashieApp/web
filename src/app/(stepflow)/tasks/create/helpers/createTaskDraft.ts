import { taskBudgetBag } from '@/app/(task)/helpers/taskBudget/taskBudget'
import { orderedPaymentMethods } from '@/app/(task)/helpers/taskPayment/taskPayment'

import type { CreateTaskFormFieldValues } from '../createTaskFormSchema'
import { CREATE_TASK_STEPS, type CreateTaskStepId } from '../views'
import { parseExactAddress } from './exactAddress'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** The answers kept between visits; photos are not. */
export type CreateTaskDraftValues = Partial<CreateTaskFormFieldValues>

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
      values.addressLine1?.trim() ||
      values.city?.trim() ||
      values.postcode?.trim() ||
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
    // A step the flow no longer has can't be reopened.
    if (!CREATE_TASK_STEPS.some((view) => view.step === draft.step)) return null
    return withPaymentMethods(
      withBudgetAnswer(withLegacyBudgetType(withExactAddress(draft))),
    )
  } catch {
    return null
  }
}

/**
 * A draft from before the address was split kept one line. It becomes line 1
 * (and city, county, postcode when the line has them).
 */
function withExactAddress(draft: CreateTaskDraft): CreateTaskDraft {
  const { streetAddress, ...values } = draft.values as CreateTaskDraftValues & {
    streetAddress?: unknown
  }
  if (typeof streetAddress !== 'string') return draft
  if (values.addressLine1) return { ...draft, values }
  return {
    ...draft,
    values: { ...values, ...parseExactAddress(streetAddress) },
  }
}

/**
 * A draft from before FE-584 kept a budget type, not a unit: per hour and per
 * day become the unit field's text, anything else the whole job.
 */
function withLegacyBudgetType(draft: CreateTaskDraft): CreateTaskDraft {
  const { budgetType, ...values } = draft.values as CreateTaskDraftValues & {
    budgetType?: unknown
  }
  if (budgetType === undefined) return draft
  const words = taskBudgetBag.en.suggestion
  const legacyUnit =
    budgetType === 'PER_HOUR'
      ? words.PER_HOUR
      : budgetType === 'PER_DAY'
        ? words.PER_DAY
        : ''
  return {
    ...draft,
    values: { ...values, budgetUnit: values.budgetUnit ?? legacyUnit },
  }
}

/**
 * A draft from before the budget question (22 Nov) has no answer of its own:
 * an amount it holds is Set a budget, Skip was Open budget, and neither
 * leaves the question to be asked.
 */
function withBudgetAnswer(draft: CreateTaskDraft): CreateTaskDraft {
  if (typeof draft.values.budgetAnswered === 'boolean') return draft
  return {
    ...draft,
    values: {
      ...draft.values,
      budgetAnswered:
        draft.values.openBudget === true ||
        Boolean(draft.values.budgetMajor?.trim()),
    },
  }
}

/**
 * A draft from before the choice of several payment methods (FE-599) kept a
 * single one: it comes back as that one, not as Cash. A draft with a list
 * keeps it, also an empty one (the poster took every method off). The same
 * as the Expo app's `draftPaymentMethods`.
 */
function withPaymentMethods(draft: CreateTaskDraft): CreateTaskDraft {
  const { paymentMethod, ...values } = draft.values as CreateTaskDraftValues & {
    paymentMethod?: unknown
  }
  if (paymentMethod === undefined) return draft
  if (Array.isArray(values.paymentMethods)) return { ...draft, values }
  const kept = orderedPaymentMethods([
    typeof paymentMethod === 'string' ? paymentMethod : null,
  ])
  return {
    ...draft,
    values: kept.length > 0 ? { ...values, paymentMethods: kept } : values,
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
    const draft: CreateTaskDraft = {
      v: 1,
      savedAt: now,
      step: input.step,
      done: input.done,
      values: input.values,
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

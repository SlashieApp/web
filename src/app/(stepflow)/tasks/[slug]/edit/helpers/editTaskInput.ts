import type { TaskContactMethod, UpdateTaskInput } from '@codegen/schema'

import { buildDatetimePayload } from '@/app/(stepflow)/tasks/create/createTaskFormSchema'
import { budgetUnitFromText } from '@/app/(task)/helpers/taskBudget/taskBudget'

import type { EditTaskFormValues } from '../editTaskFormSchema'

const BUDGET = ['budgetMajor', 'budgetCurrency', 'budgetUnit', 'openBudget']
const LOCATION = ['streetAddress', 'mapPlaceName', 'locationLat', 'locationLng']
const TIMING = ['datetimeType', 'preferredDate', 'preferredTime']

/**
 * The update for `updateTask`: only what changed (the API keeps the rest),
 * so the timeline lists real changes and an untouched contact method stays.
 * `dirty` is react-hook-form's `dirtyFields`.
 */
export function buildEditTaskInput({
  values,
  dirty,
  contact,
  publicName,
}: {
  values: EditTaskFormValues
  dirty: Partial<Record<string, unknown>>
  /** A newly picked contact method, or null to keep the current one. */
  contact: TaskContactMethod | null
  /** The town at the pin (FE-70), used when the location changed. */
  publicName: string
}): UpdateTaskInput {
  const changed = (fields: string[]) => fields.some((field) => dirty[field])
  const input: UpdateTaskInput = {}
  if (dirty.title) input.title = values.title.trim()
  if (dirty.description) input.description = values.description.trim()
  if (dirty.categories) input.categories = values.categories
  // BE-139: `budget: null` opens the budget (only when it was priced); a
  // priced one is sent whole when any part of it changed.
  if (values.openBudget) {
    if (dirty.openBudget) input.budget = null
  } else if (changed(BUDGET)) {
    input.budget = {
      amount: Number.parseFloat(values.budgetMajor),
      currency: values.budgetCurrency,
      ...budgetUnitFromText(values.budgetUnit),
    }
  }
  // FE-603: the urgent mark, added (Slashie Pro) or taken off.
  if (dirty.isUrgent) input.isUrgent = values.isUrgent
  // FE-599: the whole list replaces the task's accepted methods.
  if (dirty.paymentMethods) input.paymentMethods = values.paymentMethods
  if (changed(LOCATION)) {
    input.location = {
      lat: Number.parseFloat(values.locationLat),
      lng: Number.parseFloat(values.locationLng),
      name: publicName,
      address: values.streetAddress.trim(),
    }
  }
  if (changed(TIMING)) input.datetime = buildDatetimePayload(values)
  if (contact) input.preferredContactMethod = contact
  return input
}

/** True when the location needs saving (the town lookup only runs then). */
export function editTaskLocationChanged(
  dirty: Partial<Record<string, unknown>>,
): boolean {
  return LOCATION.some((field) => dirty[field])
}

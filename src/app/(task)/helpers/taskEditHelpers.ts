import {
  Currency,
  TaskContactMethod,
  TaskDateTimeType,
  type TaskForEditQuery,
  TaskPaymentMethod,
} from '@codegen/schema'

import {
  type CreateTaskFormFieldValues,
  londonToday,
} from '@/app/(stepflow)/tasks/create/createTaskFormSchema'
import { parseExactAddress } from '@/app/(stepflow)/tasks/create/helpers/exactAddress'
import {
  type TaskBudgetCopy,
  budgetUnitText,
  hasTaskBudget,
} from './taskBudget/taskBudget'
import { taskCategoryLabels } from './taskCategories'
import { taskPaymentMethods } from './taskPayment/taskPayment'

export type EditableTask = NonNullable<TaskForEditQuery['task']>

export function taskImageUrls(
  task:
    | Pick<EditableTask, 'images'>
    | { images?: ReadonlyArray<string | null> | null },
): string[] {
  return (task.images ?? []).filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0,
  )
}

/**
 * Map a `task(id)` record into create/edit form field values. The unit field
 * reads in the reader's language (`budgetCopy`); no budget is an open one.
 */
export function taskToEditFormValues(
  task: EditableTask,
  budgetCopy: TaskBudgetCopy,
): Omit<CreateTaskFormFieldValues, 'acceptedProhibitedUse'> {
  const dt = task.datetime
  const datetimeType = dt?.type ?? TaskDateTimeType.Flexible
  const budgetAmount = task.budget?.amount
  const lat = task.location?.lat
  const lng = task.location?.lng
  const methods = taskPaymentMethods(task)

  return {
    title: task.title?.trim() ?? '',
    // Legacy codes (HANDYMAN) become their labels, so a save tidies them.
    categories: taskCategoryLabels(task.categories),
    description: task.description?.trim() ?? '',
    ...parseExactAddress(task.location?.address?.trim() ?? ''),
    mapPlaceName: task.location?.name?.trim() ?? '',
    locationLat:
      typeof lat === 'number' && Number.isFinite(lat) ? String(lat) : '',
    locationLng:
      typeof lng === 'number' && Number.isFinite(lng) ? String(lng) : '',
    datetimeType,
    preferredDate: dt?.date?.trim() || londonToday(),
    preferredTime: dt?.time?.trim() || '09:00',
    isUrgent: task.isUrgent === true,
    budgetMajor:
      typeof budgetAmount === 'number' && Number.isFinite(budgetAmount)
        ? String(budgetAmount)
        : '',
    budgetCurrency: task.budget?.currency ?? Currency.Gbp,
    budgetUnit: budgetUnitText(task.budget, budgetCopy),
    // A saved task has its answer: a budget, or an open one.
    budgetAnswered: true,
    openBudget: !hasTaskBudget(task.budget),
    // An older task reads as its one method; one saved with none starts on Cash.
    paymentMethods: methods.length > 0 ? methods : [TaskPaymentMethod.Cash],
    // contactMethod was removed from the Task type; the edit form starts from
    // the default (per-task contact method now lives on the poster profile).
    preferredContactMethod: TaskContactMethod.InApp,
  }
}

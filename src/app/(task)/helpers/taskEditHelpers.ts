import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  type TaskForEditQuery,
  TaskPaymentMethod,
} from '@codegen/schema'

import {
  type CreateTaskFormFieldValues,
  londonToday,
} from '@/app/(stepflow)/tasks/create/createTaskFormSchema'
import { taskCategoryLabels } from './taskCategories'

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

/** Map a `task(id)` record into create/edit form field values. */
export function taskToEditFormValues(
  task: EditableTask,
): Omit<CreateTaskFormFieldValues, 'acceptedProhibitedUse'> {
  const dt = task.datetime
  const datetimeType = dt?.type ?? TaskDateTimeType.Flexible
  const budgetAmount = task.budget?.amount
  const lat = task.location?.lat
  const lng = task.location?.lng

  return {
    title: task.title?.trim() ?? '',
    // Legacy codes (HANDYMAN) become their labels, so a save tidies them.
    categories: taskCategoryLabels(task.categories),
    description: task.description?.trim() ?? '',
    streetAddress: task.location?.address?.trim() ?? '',
    mapPlaceName: task.location?.name?.trim() ?? '',
    locationLat:
      typeof lat === 'number' && Number.isFinite(lat) ? String(lat) : '',
    locationLng:
      typeof lng === 'number' && Number.isFinite(lng) ? String(lng) : '',
    datetimeType,
    preferredDate: dt?.date?.trim() || londonToday(),
    preferredTime: dt?.time?.trim() || '09:00',
    budgetMajor:
      typeof budgetAmount === 'number' && Number.isFinite(budgetAmount)
        ? String(budgetAmount)
        : '',
    budgetCurrency: task.budget?.currency ?? Currency.Gbp,
    budgetType: task.budget?.type ?? TaskBudgetType.OneOff,
    paymentMethod: task.budget?.paymentMethod ?? TaskPaymentMethod.Cash,
    // contactMethod was removed from the Task type; the edit form starts from
    // the default (per-task contact method now lives on the poster profile).
    preferredContactMethod: TaskContactMethod.InApp,
  }
}

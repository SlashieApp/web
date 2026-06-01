import {
  Currency,
  QuoteStatus,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
  type TaskQuery,
  TaskStatus,
} from '@codegen/schema'

import {
  type CreateTaskFormValues,
  buildDatetimePayload,
  toYmd,
} from '../tasks/create/createTaskFormSchema'
import { taskCreateCategorySchema } from './taskCategories'

export type EditableTask = NonNullable<TaskQuery['task']>

export function taskImageUrls(
  task:
    | Pick<EditableTask, 'images'>
    | { images?: ReadonlyArray<string | null> | null },
): string[] {
  return (task.images ?? []).filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0,
  )
}

export function isTaskEditable(status: string): boolean {
  return status === TaskStatus.Open || status === TaskStatus.Draft
}

export function countAcceptedQuotes(
  quotes: ReadonlyArray<{ status: string }> | undefined,
): number {
  if (!quotes?.length) return 0
  return quotes.filter(
    (q) =>
      q.status === QuoteStatus.Accepted ||
      /accept|award|select|win|approved|chosen/i.test(q.status.trim()),
  ).length
}

/** Map a `task(id)` record into create/edit form field values. */
export function taskToEditFormValues(
  task: EditableTask,
): CreateTaskFormValues & {
  acceptedWorkerCap: number
} {
  const dt = task.datetime
  const datetimeType = dt?.type ?? TaskDateTimeType.Flexible
  const budgetAmount = task.budget?.amount
  const lat = task.location?.lat
  const lng = task.location?.lng

  const categoryParsed = taskCreateCategorySchema.safeParse(
    task.category?.trim() ?? '',
  )

  return {
    title: task.title?.trim() ?? '',
    category: categoryParsed.success
      ? categoryParsed.data
      : taskCreateCategorySchema.parse('GENERAL'),
    description: task.description?.trim() ?? '',
    streetAddress: task.location?.address?.trim() ?? '',
    mapPlaceName: task.location?.name?.trim() ?? '',
    locationLat:
      typeof lat === 'number' && Number.isFinite(lat) ? String(lat) : '51.5074',
    locationLng:
      typeof lng === 'number' && Number.isFinite(lng) ? String(lng) : '-0.1278',
    datetimeType,
    preferredDate: dt?.date?.trim() || toYmd(new Date()),
    preferredTime: dt?.time?.trim() || '09:00',
    budgetMajor:
      typeof budgetAmount === 'number' && Number.isFinite(budgetAmount)
        ? String(budgetAmount)
        : '',
    budgetCurrency: task.budget?.currency ?? Currency.Gbp,
    budgetType: task.budget?.type ?? TaskBudgetType.OneOff,
    paymentMethod: task.budget?.paymentMethod ?? TaskPaymentMethod.Cash,
    preferredContactMethod:
      (task.contactMethod as TaskContactMethod | null | undefined) ??
      TaskContactMethod.InApp,
    acceptedWorkerCap:
      typeof task.acceptedWorkerCap === 'number' && task.acceptedWorkerCap >= 1
        ? task.acceptedWorkerCap
        : 1,
  }
}

export function buildUpdateTaskInput(
  values: CreateTaskFormValues & { acceptedWorkerCap: number },
) {
  const parsedBudget = Number.parseFloat(values.budgetMajor)
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    budget: {
      amount: parsedBudget,
      currency: values.budgetCurrency,
      type: values.budgetType,
      paymentMethod: values.paymentMethod,
    },
    location: {
      lat: Number.parseFloat(values.locationLat),
      lng: Number.parseFloat(values.locationLng),
      name: values.mapPlaceName.trim(),
      address: values.streetAddress.trim(),
    },
    datetime: buildDatetimePayload(values),
    preferredContactMethod: values.preferredContactMethod,
    acceptedWorkerCap: values.acceptedWorkerCap,
  }
}

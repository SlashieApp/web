import { z } from 'zod'

/**
 * Validation messages are copy keys in `i11n.json` → `errors` (en + zh-HK),
 * shown with `taskFieldError`.
 */

import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'

import { taskCategoriesSchema } from '@/app/(task)/helpers/taskCategories'

export const taskDetailsFields = {
  title: z.string().trim().min(1, 'titleRequired'),
  categories: taskCategoriesSchema,
  description: z.string().trim().min(1, 'descriptionRequired'),
  streetAddress: z.string().trim().min(1, 'addressRequired'),
  mapPlaceName: z.string().trim().min(1, 'areaRequired'),
  locationLat: z
    .string()
    .trim()
    .refine((s) => {
      const n = Number.parseFloat(s)
      return Number.isFinite(n) && !Number.isNaN(n)
    }, 'mapUnreadable'),
  locationLng: z
    .string()
    .trim()
    .refine((s) => {
      const n = Number.parseFloat(s)
      return Number.isFinite(n) && !Number.isNaN(n)
    }, 'mapUnreadable'),
  datetimeType: z.nativeEnum(TaskDateTimeType),
  preferredDate: z.string(),
  preferredTime: z.string(),
  budgetMajor: z
    .string()
    .trim()
    .refine((s) => {
      const n = Number.parseFloat(s)
      return Number.isFinite(n) && n > 0
    }, 'budgetRequired'),
  budgetCurrency: z.nativeEnum(Currency),
  budgetType: z.nativeEnum(TaskBudgetType),
  paymentMethod: z.nativeEnum(TaskPaymentMethod),
  preferredContactMethod: z.nativeEnum(TaskContactMethod),
}

export function refineTaskSchedule(
  data: {
    datetimeType: TaskDateTimeType
    preferredDate: string
    preferredTime: string
  },
  ctx: z.RefinementCtx,
) {
  if (
    data.datetimeType === TaskDateTimeType.Before ||
    data.datetimeType === TaskDateTimeType.Exact
  ) {
    if (!data.preferredDate.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'dateRequired',
        path: ['preferredDate'],
      })
    } else if (data.preferredDate < toYmd(new Date())) {
      ctx.addIssue({
        code: 'custom',
        message: 'dateInPast',
        path: ['preferredDate'],
      })
    }
  }
  if (data.datetimeType === TaskDateTimeType.Exact) {
    if (!data.preferredTime.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'timeRequired',
        path: ['preferredTime'],
      })
    } else {
      const parsed = new Date(`${data.preferredDate}T${data.preferredTime}:00`)
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: 'custom',
          message: 'timeInvalid',
          path: ['preferredTime'],
        })
      }
    }
  }
}

export const createTaskFormSchema = z
  .object({
    ...taskDetailsFields,
    acceptedProhibitedUse: z.boolean(),
  })
  .superRefine((data, ctx) => {
    refineTaskSchedule(data, ctx)
    if (!data.acceptedProhibitedUse) {
      ctx.addIssue({
        code: 'custom',
        message: 'consentRequired',
        path: ['acceptedProhibitedUse'],
      })
    }
  })

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>
/** Values as held in the form (`react-hook-form` / field inputs) before Zod coercion. */
export type CreateTaskFormFieldValues = z.input<typeof createTaskFormSchema>

export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildDatetimePayload(values: {
  datetimeType: TaskDateTimeType
  preferredDate: string
  preferredTime: string
}): {
  type: TaskDateTimeType
  date?: string
  time?: string
} {
  if (values.datetimeType === TaskDateTimeType.Flexible) {
    return { type: TaskDateTimeType.Flexible }
  }
  if (values.datetimeType === TaskDateTimeType.Before) {
    return {
      type: TaskDateTimeType.Before,
      date: values.preferredDate.trim() || undefined,
    }
  }
  return {
    type: TaskDateTimeType.Exact,
    date: values.preferredDate.trim() || undefined,
    time: values.preferredTime.trim() || undefined,
  }
}

import { z } from 'zod'

/**
 * Validation messages are copy keys in `i11n.json` → `errors` (en + zh-HK),
 * shown with `taskFieldError`.
 */

import {
  Currency,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'

import {
  CUSTOM_UNIT_MAX,
  normalizeUnitText,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
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
  /** Marked urgent (FE-603): a Slashie Pro feature, checked by the API. */
  isUrgent: z.boolean(),
  /** The amount; checked by `refineTaskBudget`, as an open budget has none. */
  budgetMajor: z.string().trim(),
  budgetCurrency: z.nativeEnum(Currency),
  /**
   * What the amount is for (FE-584): blank is the whole job, a suggestion is
   * that unit, anything else is the poster's own words (`budgetUnitFromText`).
   */
  budgetUnit: z.string(),
  /**
   * "Do you have a budget in mind?" has been answered (Ryan 22 Nov): false on
   * a new task, where neither choice starts picked. With `openBudget` it
   * reads Set a budget (false) or Open budget (true).
   */
  budgetAnswered: z.boolean(),
  /** Open budget: no amount, workers quote their own price (BE-139). */
  openBudget: z.boolean(),
  /** Every method the poster accepts (FE-599): at least one. */
  paymentMethods: z
    .array(z.nativeEnum(TaskPaymentMethod))
    .min(1, 'paymentMethodRequired'),
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
    } else if (!isCalendarDate(data.preferredDate.trim())) {
      ctx.addIssue({
        code: 'custom',
        message: 'dateInvalid',
        path: ['preferredDate'],
      })
    } else if (data.preferredDate.trim() < londonToday()) {
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

/**
 * The budget question answered; then an amount above zero, unless it is an
 * open budget; the unit fits the API's 30 characters (`INVALID_BUDGET_UNIT`).
 */
export function refineTaskBudget(
  data: {
    budgetMajor: string
    budgetUnit: string
    budgetAnswered: boolean
    openBudget: boolean
  },
  ctx: z.RefinementCtx,
) {
  if (!data.budgetAnswered) {
    ctx.addIssue({
      code: 'custom',
      message: 'budgetChoiceRequired',
      path: ['budgetAnswered'],
    })
    return
  }
  if (data.openBudget) return
  const amount = Number.parseFloat(data.budgetMajor)
  if (!(Number.isFinite(amount) && amount > 0)) {
    ctx.addIssue({
      code: 'custom',
      message: 'budgetRequired',
      path: ['budgetMajor'],
    })
  }
  if (normalizeUnitText(data.budgetUnit).length > CUSTOM_UNIT_MAX) {
    ctx.addIssue({
      code: 'custom',
      message: 'budgetUnitTooLong',
      path: ['budgetUnit'],
    })
  }
}

export const createTaskFormSchema = z
  .object({
    ...taskDetailsFields,
    acceptedProhibitedUse: z.boolean(),
  })
  .superRefine((data, ctx) => {
    refineTaskSchedule(data, ctx)
    refineTaskBudget(data, ctx)
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

/** The UK calendar the API checks BEFORE and EXACT dates against. */
const LONDON_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/**
 * Today in London as YYYY-MM-DD: the earliest date the API takes
 * (DATE_IN_PAST before it), whatever the device's own time zone.
 */
export function londonToday(now: Date = new Date()): string {
  return LONDON_DAY.format(now)
}

/** A real YYYY-MM-DD day (the API's INVALID_DATE otherwise). */
export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number) as [
    number,
    number,
    number,
  ]
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  )
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

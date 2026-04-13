import { z } from 'zod'

import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'

export const createTaskFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Please add a task title.'),
    description: z
      .string()
      .trim()
      .min(1, 'Please describe what needs to be done.'),
    streetAddress: z
      .string()
      .trim()
      .min(1, 'Please add your property address.'),
    postcode: z.string().trim().min(1, 'Please add your postcode.'),
    mapPlaceName: z
      .string()
      .trim()
      .min(1, 'Search or move the map to set your task area.'),
    locationLat: z
      .string()
      .trim()
      .refine((s) => {
        const n = Number.parseFloat(s)
        return Number.isFinite(n) && !Number.isNaN(n)
      }, 'Could not read map latitude. Try moving the map slightly.'),
    locationLng: z
      .string()
      .trim()
      .refine((s) => {
        const n = Number.parseFloat(s)
        return Number.isFinite(n) && !Number.isNaN(n)
      }, 'Could not read map longitude. Try moving the map slightly.'),
    datetimeType: z.nativeEnum(TaskDateTimeType),
    preferredDate: z.string(),
    preferredTime: z.string(),
    budgetMajor: z
      .string()
      .trim()
      .refine((s) => {
        const n = Number.parseFloat(s)
        return Number.isFinite(n) && n > 0
      }, 'Please provide a valid budget amount.'),
    budgetCurrency: z.nativeEnum(Currency),
    budgetType: z.nativeEnum(TaskBudgetType),
    paymentMethod: z.nativeEnum(TaskPaymentMethod),
    preferredContactMethod: z.nativeEnum(TaskContactMethod),
  })
  .superRefine((data, ctx) => {
    if (
      data.datetimeType === TaskDateTimeType.Before ||
      data.datetimeType === TaskDateTimeType.Exact
    ) {
      if (!data.preferredDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please choose a date for this timing option.',
          path: ['preferredDate'],
        })
      }
    }
    if (data.datetimeType === TaskDateTimeType.Exact) {
      if (!data.preferredTime.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please choose a time for an exact slot.',
          path: ['preferredTime'],
        })
      } else {
        const parsed = new Date(
          `${data.preferredDate}T${data.preferredTime}:00`,
        )
        if (Number.isNaN(parsed.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please provide a valid date and time.',
            path: ['preferredTime'],
          })
        }
      }
    }
  })

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>

export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildDatetimePayload(values: CreateTaskFormValues): {
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

import { z } from 'zod'

import {
  BudgetUnit,
  DayOfWeek,
  TaskCategory,
  TaskContactMethod,
  type TaskDayAvailabilityInput,
  TaskPaymentMethod,
} from '@codegen/schema'

export type TimeSlotTemplate = { value: string; label: string }

export const TIME_SLOT_OPTIONS: readonly TimeSlotTemplate[] = [
  { value: 'MORNING', label: 'Morning (8am–12pm)' },
  { value: 'AFTERNOON', label: 'Afternoon (12pm–4pm)' },
  { value: 'EVENING', label: 'Evening (4pm–8pm)' },
  { value: 'ANYTIME', label: 'Anytime' },
] as const

export const SLOT_LABEL_BY_VALUE = Object.fromEntries(
  TIME_SLOT_OPTIONS.map((s) => [s.value, s.label]),
) as Record<string, string>

const slotsByDaySchema = z
  .object({
    [DayOfWeek.Sun]: z.array(z.string()),
    [DayOfWeek.Mon]: z.array(z.string()),
    [DayOfWeek.Tue]: z.array(z.string()),
    [DayOfWeek.Wed]: z.array(z.string()),
    [DayOfWeek.Thu]: z.array(z.string()),
    [DayOfWeek.Fri]: z.array(z.string()),
    [DayOfWeek.Sat]: z.array(z.string()),
  })
  .refine((val) => Object.values(val).some((a) => a.length > 0), {
    message:
      'Add at least one weekly time window so workers know when you are free.',
  })

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
    category: z.nativeEnum(TaskCategory),
    preferredDate: z.string().min(1, 'Please choose a preferred date.'),
    preferredTime: z.string().min(1, 'Please choose a preferred time.'),
    slotsByDay: slotsByDaySchema,
    budgetMajor: z
      .string()
      .trim()
      .refine((s) => {
        const n = Number.parseFloat(s)
        return Number.isFinite(n) && n > 0
      }, 'Please provide a valid budget amount.'),
    budgetUnit: z.nativeEnum(BudgetUnit),
    paymentMethod: z.nativeEnum(TaskPaymentMethod),
    preferredContactMethod: z.nativeEnum(TaskContactMethod),
  })
  .superRefine((data, ctx) => {
    const parsed = new Date(`${data.preferredDate}T${data.preferredTime}:00`)
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide a valid preferred date and time.',
        path: ['preferredTime'],
      })
    }
  })

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>

export function emptySlotsByDay(): Record<DayOfWeek, string[]> {
  return {
    [DayOfWeek.Sun]: [],
    [DayOfWeek.Mon]: [],
    [DayOfWeek.Tue]: [],
    [DayOfWeek.Wed]: [],
    [DayOfWeek.Thu]: [],
    [DayOfWeek.Fri]: [],
    [DayOfWeek.Sat]: [],
  }
}

export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildAvailabilityPayload(
  values: CreateTaskFormValues,
): TaskDayAvailabilityInput[] {
  const out: TaskDayAvailabilityInput[] = []
  for (const day of Object.values(DayOfWeek)) {
    const raw = values.slotsByDay[day] ?? []
    if (raw.length === 0) continue
    const labels = raw.map(
      (v) => SLOT_LABEL_BY_VALUE[v] ?? TIME_SLOT_OPTIONS[0]?.label ?? v,
    )
    out.push({ day, slots: labels })
  }
  return out
}

export function toPreferredDateTimeIso(values: CreateTaskFormValues): string {
  return new Date(
    `${values.preferredDate}T${values.preferredTime}:00`,
  ).toISOString()
}

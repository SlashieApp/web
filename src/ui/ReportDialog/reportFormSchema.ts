import { z } from 'zod'

export const REPORT_REASON_VALUES = [
  'misleading',
  'safety',
  'spam',
  'harassment',
  'other',
] as const

export type ReportReasonValue = (typeof REPORT_REASON_VALUES)[number]

export const reportFormSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES),
  details: z.string().trim().max(2000),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>

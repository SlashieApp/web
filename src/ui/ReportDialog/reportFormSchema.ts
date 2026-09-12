import { z } from 'zod'

export const REPORT_REASON_VALUES = [
  'spam',
  'harassment',
  'illegal',
  'scam',
  'safety',
  'other',
] as const

export type ReportReasonValue = (typeof REPORT_REASON_VALUES)[number]

export const reportFormSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES, {
    errorMap: () => ({ message: 'Choose a reason.' }),
  }),
  details: z.string().trim().max(2000),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>

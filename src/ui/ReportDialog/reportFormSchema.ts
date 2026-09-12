import { z } from 'zod'

/** Matches BE-40 `CreateReportInput.reason`. */
export const REPORT_REASON_VALUES = [
  'SPAM',
  'HARASSMENT',
  'ILLEGAL_OR_PROHIBITED',
  'SCAM',
  'OTHER',
] as const

export type ReportReasonValue = (typeof REPORT_REASON_VALUES)[number]

export type ReportTargetKind = 'task' | 'worker'

export const reportFormSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES),
  details: z.string().trim().max(2000),
})

export type ReportFormValues = z.infer<typeof reportFormSchema>

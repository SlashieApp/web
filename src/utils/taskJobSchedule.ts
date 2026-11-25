import { QuoteStatus, TaskDateTimeType } from '@codegen/schema'

import { startOfLocalDay } from '@/utils/startOfLocalDay'

export type TaskDatetimeLike = {
  date?: string | null
  time?: string | null
  type: TaskDateTimeType | string
}

export type ScheduleChip = 'today' | 'tomorrow' | 'overdue' | null

export function parseTaskScheduleDate(
  datetime: TaskDatetimeLike | null | undefined,
): Date | null {
  if (!datetime || datetime.type !== TaskDateTimeType.Exact) return null
  const date = datetime.date?.trim()
  if (!date) return null
  const time = datetime.time?.trim() || '00:00'
  const parsed = new Date(`${date}T${time}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function scheduleChipForTask(
  datetime: TaskDatetimeLike | null | undefined,
  now = new Date(),
): ScheduleChip {
  const when = parseTaskScheduleDate(datetime)
  if (!when) return null

  const dayMs = 24 * 60 * 60 * 1000
  const taskDay = startOfLocalDay(when)
  const today = startOfLocalDay(now)
  const tomorrow = today + dayMs

  if (taskDay < today) return 'overdue'
  if (taskDay === today) return 'today'
  if (taskDay === tomorrow) return 'tomorrow'
  return null
}

/**
 * The Done card's date (Ryan, 2026-11-07): the booked start without the
 * weekday, in the viewer's language ("10 Jun, 14:00"), so the date and the
 * compact slide share one row on a 390 phone. Expo formats it the same way.
 */
export function formatDoneCardDate(
  bookedStart: unknown,
  locale: string,
): string | null {
  const start = new Date(String(bookedStart))
  if (Number.isNaN(start.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
}

/** Exactly ACCEPTED: no other status means the quote won. */
export function isAcceptedQuoteStatus(status: string): boolean {
  return status.trim().toUpperCase() === QuoteStatus.Accepted
}

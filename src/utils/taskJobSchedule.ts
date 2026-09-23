import { QuoteStatus, TaskDateTimeType, TaskStatus } from '@codegen/schema'

export type TaskDatetimeLike = {
  date?: string | null
  time?: string | null
  type: TaskDateTimeType | string
}

export type TaskScheduleLike = {
  datetime?: TaskDatetimeLike | null
  status: string
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

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const dayMs = 24 * 60 * 60 * 1000
  const taskDay = startOfDay(when).getTime()
  const today = startOfDay(now).getTime()
  const tomorrow = today + dayMs

  if (taskDay < today) return 'overdue'
  if (taskDay === today) return 'today'
  if (taskDay === tomorrow) return 'tomorrow'
  return null
}

export function formatTaskScheduleLabel(
  datetime: TaskDatetimeLike | null | undefined,
): string | null {
  if (!datetime) return null
  if (datetime.type === TaskDateTimeType.Flexible) {
    return 'Flexible timing — agree with the other party'
  }
  if (datetime.type === TaskDateTimeType.Before) {
    const date = datetime.date?.trim()
    return date ? `Before ${date}` : 'Before agreed date'
  }
  const when = parseTaskScheduleDate(datetime)
  if (!when) return null
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(when)
}

/**
 * Before the scheduled time, or when timing is flexible, the worker should
 * still be on site. Once an exact or deadline time has passed, they can
 * mark the job complete.
 */
export function workerOnSitePhase(
  datetime: TaskDatetimeLike | null | undefined,
  now = new Date(),
): 'onsite' | 'complete' {
  if (!datetime || datetime.type === TaskDateTimeType.Flexible) return 'onsite'
  if (datetime.type === TaskDateTimeType.Before) {
    const date = datetime.date?.trim()
    if (!date) return 'onsite'
    const end = new Date(`${date}T23:59:59`)
    if (Number.isNaN(end.getTime()) || end.getTime() >= now.getTime()) {
      return 'onsite'
    }
    return 'complete'
  }
  const when = parseTaskScheduleDate(datetime)
  if (!when || when.getTime() > now.getTime()) return 'onsite'
  return 'complete'
}

export function countdownToExactSchedule(
  datetime: TaskDatetimeLike | null | undefined,
  now = new Date(),
): string | null {
  const when = parseTaskScheduleDate(datetime)
  if (!when) return null
  const diffMs = when.getTime() - now.getTime()
  if (diffMs <= 0) return 'Scheduled time has passed'
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000))
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} until job`
  }
  if (hours >= 1) return `${hours}h ${minutes}m until job`
  return `${minutes} minute${minutes === 1 ? '' : 's'} until job`
}

export function isAcceptedQuoteStatus(status: string): boolean {
  return status === QuoteStatus.Accepted || /accept|award|select/i.test(status)
}

export function isJobClosedStatus(status: string): boolean {
  return (
    status === TaskStatus.Confirmed ||
    status === TaskStatus.Cancelled ||
    /confirm|closed/i.test(status)
  )
}

export function canSubmitNewQuote(
  task: {
    status: string
    quotes?: ReadonlyArray<{ workerUserId: string; status: string }>
  },
  workerUserId: string | undefined,
): boolean {
  if (!workerUserId) return false
  if (task.status !== TaskStatus.Open) return false
  const accepted = task.quotes?.some((q) => isAcceptedQuoteStatus(q.status))
  if (accepted) return false
  const mine = task.quotes?.find((q) => q.workerUserId === workerUserId)
  if (mine && isAcceptedQuoteStatus(mine.status)) return false
  return true
}

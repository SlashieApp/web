import { TaskDateTimeType } from '@codegen/schema'

import type { TaskItem } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import {
  type ScheduleChip,
  formatTaskScheduleLabel,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import {
  formatCalendarDateKey,
  formatCalendarDateLabel,
  formatDayGroupLabel,
  formatDayKey,
  formatEventTimeLabel,
  groupUpcomingEvents,
  startOfDay,
} from '../../helpers/dashboardSchedule'

import {
  type WorkerQuoteRow,
  workerQuotePricePence,
  workerQuoteStage,
} from '../../helpers/workerQuoteJobs'

export type WorkerQuoteCalendarMark = 'booked' | 'upcoming'

export type WorkerQuoteUpcomingEvent = {
  rowId: string
  taskId: string
  title: string
  location: string
  when: Date | null
  timeLabel: string
  dayGroupKey: string
  dayGroupLabel: string
  status: 'booked' | 'upcoming'
  href: string
}

export type WorkerQuoteSummaryCounts = {
  pending: number
  booked: number
  actionToday: number
  bookedValuePence: number
}

function isActiveBookedRow(row: WorkerQuoteRow): boolean {
  const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
  if (stage !== 'booked') return false
  if (row.workerOrder && isOrderClosed(row.workerOrder.status)) return false
  return true
}

export function workerQuoteSummaryCounts(
  rows: readonly WorkerQuoteRow[],
  now = new Date(),
): WorkerQuoteSummaryCounts {
  let pending = 0
  let booked = 0
  let actionToday = 0
  let bookedValuePence = 0

  for (const row of rows) {
    const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
    if (stage === 'pending') pending += 1
    if (isActiveBookedRow(row)) {
      booked += 1
      const quotePence = workerQuotePricePence(row.quote, row.workerOrder)
      if (quotePence != null && quotePence > 0) {
        bookedValuePence += quotePence
      }
      const chip = scheduleChipForTask(row.task.datetime, now)
      if (chip === 'today') actionToday += 1
    }
  }

  return { pending, booked, actionToday, bookedValuePence }
}

export function buildWorkerQuoteUpcomingEvents(
  rows: readonly WorkerQuoteRow[],
  now = new Date(),
  limit = 8,
): WorkerQuoteUpcomingEvent[] {
  const events: WorkerQuoteUpcomingEvent[] = []
  const todayStart = startOfDay(now).getTime()

  for (const row of rows) {
    const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
    if (stage === 'closed' || stage === 'ended') continue

    const isBooked = isActiveBookedRow(row)
    const when = parseTaskScheduleDate(row.task.datetime)

    if (isBooked) {
      events.push({
        rowId: row.quote.id,
        taskId: row.task.id,
        title: row.task.title,
        location: taskPublicLocationLabel(row.task) || 'Location TBC',
        when,
        timeLabel: formatEventTimeLabel(row.task, when),
        dayGroupKey: when ? formatDayKey(when) : 'flexible',
        dayGroupLabel: when
          ? formatDayGroupLabel(row.task.datetime, when, now)
          : 'Flexible timing',
        status: 'booked',
        href: taskOrderSectionHref(row.task.id),
      })
      continue
    }

    if (stage === 'pending' && when && when.getTime() >= todayStart) {
      events.push({
        rowId: row.quote.id,
        taskId: row.task.id,
        title: row.task.title,
        location: taskPublicLocationLabel(row.task) || 'Location TBC',
        when,
        timeLabel: formatEventTimeLabel(row.task, when),
        dayGroupKey: formatDayKey(when),
        dayGroupLabel: formatDayGroupLabel(row.task.datetime, when, now),
        status: 'upcoming',
        href: `/tasks/${row.task.id}`,
      })
    }
  }

  return events
    .sort((a, b) => {
      const aTime = a.when?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bTime = b.when?.getTime() ?? Number.MAX_SAFE_INTEGER
      return aTime - bTime
    })
    .slice(0, limit)
}

export function groupWorkerQuoteUpcomingEvents(
  events: readonly WorkerQuoteUpcomingEvent[],
): { label: string; events: WorkerQuoteUpcomingEvent[] }[] {
  return groupUpcomingEvents(events)
}

export function calendarMarksForMonth(
  rows: readonly WorkerQuoteRow[],
  year: number,
  month: number,
): Map<number, Set<WorkerQuoteCalendarMark>> {
  const marks = new Map<number, Set<WorkerQuoteCalendarMark>>()

  for (const row of rows) {
    const when = parseTaskScheduleDate(row.task.datetime)
    if (!when) continue
    if (when.getFullYear() !== year || when.getMonth() !== month) continue

    const day = when.getDate()
    const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
    const mark: WorkerQuoteCalendarMark = isActiveBookedRow(row)
      ? 'booked'
      : stage === 'pending'
        ? 'upcoming'
        : 'upcoming'

    const existing = marks.get(day) ?? new Set<WorkerQuoteCalendarMark>()
    existing.add(mark)
    marks.set(day, existing)
  }

  return marks
}

export function scheduleChipForQuoteRow(
  row: WorkerQuoteRow,
  now = new Date(),
): ScheduleChip {
  return scheduleChipForTask(row.task.datetime, now)
}

export function scheduleDetailForQuoteRow(row: WorkerQuoteRow): string | null {
  return formatTaskScheduleLabel(row.task.datetime)
}

/** Compact onsite label for booked quote cards (e.g. `Today · 14:00`). */
export function workerQuoteOnsiteScheduleLabel(
  task: TaskItem,
  now = new Date(),
): string | null {
  const when = parseTaskScheduleDate(task.datetime)
  if (!when) {
    if (task.datetime?.type === TaskDateTimeType.Flexible)
      return 'Flexible timing'
    return null
  }

  const chip = scheduleChipForTask(task.datetime, now)
  const timeLabel = formatEventTimeLabel(task, when)

  if (chip === 'today') return `Today · ${timeLabel}`
  if (chip === 'tomorrow') return `Tomorrow · ${timeLabel}`

  const dayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(when)

  return `${dayLabel} · ${timeLabel}`
}

/** Short countdown copy for active booked jobs (e.g. `Be on site in 4h`). */
export function workerQuoteOnsiteCountdown(
  task: TaskItem,
  now = new Date(),
): string | null {
  const when = parseTaskScheduleDate(task.datetime)
  if (!when) return null

  const diffMs = when.getTime() - now.getTime()
  if (diffMs <= 0) return 'Scheduled time has passed'

  const hours = Math.ceil(diffMs / (60 * 60 * 1000))
  if (hours >= 48) {
    const days = Math.ceil(hours / 24)
    return `Be on site in ${days}d`
  }
  return `Be on site in ${hours}h`
}

/** `YYYY-MM-DD` key for a scheduled task date, or `null` when not schedulable. */
export function workerQuoteScheduleDateKey(row: WorkerQuoteRow): string | null {
  const when = parseTaskScheduleDate(row.task.datetime)
  if (!when) return null
  return formatCalendarDateKey(
    when.getFullYear(),
    when.getMonth(),
    when.getDate(),
  )
}

export { formatCalendarDateKey, formatCalendarDateLabel }

export function workerQuoteRowOnDate(
  row: WorkerQuoteRow,
  dateKey: string,
): boolean {
  return workerQuoteScheduleDateKey(row) === dateKey
}

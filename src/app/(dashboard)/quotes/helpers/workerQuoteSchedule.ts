import { TaskDateTimeType } from '@codegen/schema'

import { type TaskItem, quotePricePence } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import {
  type ScheduleChip,
  formatTaskScheduleLabel,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import {
  type WorkerQuoteRow,
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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatDayKey(when: Date): string {
  return `${when.getFullYear()}-${when.getMonth()}-${when.getDate()}`
}

function formatDayGroupLabel(
  datetime: TaskItem['datetime'],
  when: Date,
  now: Date,
): string {
  const chip = scheduleChipForTask(datetime, now)

  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(when)

  if (chip === 'today') return `Today · ${weekday}`
  if (chip === 'tomorrow') return `Tomorrow · ${weekday}`
  return weekday
}

function formatEventTimeLabel(task: TaskItem, when: Date | null): string {
  if (!when) {
    if (task.datetime?.type === TaskDateTimeType.Flexible) return 'Flexible'
    return 'Time TBC'
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(when)
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
      bookedValuePence += quotePricePence(row.quote)
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
  const groups = new Map<string, WorkerQuoteUpcomingEvent[]>()

  for (const event of events) {
    const bucket = groups.get(event.dayGroupKey) ?? []
    bucket.push(event)
    groups.set(event.dayGroupKey, bucket)
  }

  return [...groups.entries()].map(([, groupEvents]) => ({
    label: groupEvents[0]?.dayGroupLabel ?? 'Upcoming',
    events: groupEvents,
  }))
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

export function formatCalendarDateKey(
  year: number,
  month: number,
  day: number,
): string {
  const monthLabel = String(month + 1).padStart(2, '0')
  const dayLabel = String(day).padStart(2, '0')
  return `${year}-${monthLabel}-${dayLabel}`
}

export function workerQuoteRowOnDate(
  row: WorkerQuoteRow,
  dateKey: string,
): boolean {
  return workerQuoteScheduleDateKey(row) === dateKey
}

export function formatCalendarDateLabel(dateKey: string): string {
  const parsed = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

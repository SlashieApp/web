import { TaskDateTimeType } from '@codegen/schema'

import { type TaskItem, taskBudgetPence } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import {
  type ScheduleChip,
  formatTaskScheduleLabel,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import {
  type PostedTaskRow,
  postedTaskStage,
} from '../../helpers/postedTaskCustomer'

export type PostedTaskCalendarMark = 'booked' | 'upcoming'

export type PostedTaskUpcomingEvent = {
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

export type PostedTaskSummaryCounts = {
  quoting: number
  booked: number
  actionToday: number
  bookedBudgetPence: number
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

function isActiveBookedRow(row: PostedTaskRow): boolean {
  const stage = postedTaskStage(row.task, row.customerOrder)
  if (stage !== 'booked') return false
  if (row.customerOrder && isOrderClosed(row.customerOrder.status)) return false
  return true
}

export function postedTaskSummaryCounts(
  rows: readonly PostedTaskRow[],
  now = new Date(),
): PostedTaskSummaryCounts {
  let quoting = 0
  let booked = 0
  let actionToday = 0
  let bookedBudgetPence = 0

  for (const row of rows) {
    const stage = postedTaskStage(row.task, row.customerOrder)
    if (stage === 'quoting' || stage === 'draft') quoting += 1
    if (isActiveBookedRow(row)) {
      booked += 1
      bookedBudgetPence += taskBudgetPence(row.task)
      const chip = scheduleChipForTask(row.task.datetime, now)
      if (chip === 'today') actionToday += 1
    }
  }

  return { quoting, booked, actionToday, bookedBudgetPence }
}

export function buildPostedTaskUpcomingEvents(
  rows: readonly PostedTaskRow[],
  now = new Date(),
  limit = 8,
): PostedTaskUpcomingEvent[] {
  const events: PostedTaskUpcomingEvent[] = []
  const todayStart = startOfDay(now).getTime()

  for (const row of rows) {
    const stage = postedTaskStage(row.task, row.customerOrder)
    if (stage === 'done' || stage === 'cancelled') continue

    const isBooked = isActiveBookedRow(row)
    const when = parseTaskScheduleDate(row.task.datetime)

    if (isBooked) {
      events.push({
        rowId: row.task.id,
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

    if (
      (stage === 'quoting' || stage === 'draft') &&
      when &&
      when.getTime() >= todayStart
    ) {
      events.push({
        rowId: row.task.id,
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

export function groupPostedTaskUpcomingEvents(
  events: readonly PostedTaskUpcomingEvent[],
): { label: string; events: PostedTaskUpcomingEvent[] }[] {
  const groups = new Map<string, PostedTaskUpcomingEvent[]>()

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
  rows: readonly PostedTaskRow[],
  year: number,
  month: number,
): Map<number, Set<PostedTaskCalendarMark>> {
  const marks = new Map<number, Set<PostedTaskCalendarMark>>()

  for (const row of rows) {
    const when = parseTaskScheduleDate(row.task.datetime)
    if (!when) continue
    if (when.getFullYear() !== year || when.getMonth() !== month) continue

    const day = when.getDate()
    const mark: PostedTaskCalendarMark = isActiveBookedRow(row)
      ? 'booked'
      : 'upcoming'

    const existing = marks.get(day) ?? new Set<PostedTaskCalendarMark>()
    existing.add(mark)
    marks.set(day, existing)
  }

  return marks
}

export function scheduleChipForPostedTaskRow(
  row: PostedTaskRow,
  now = new Date(),
): ScheduleChip {
  return scheduleChipForTask(row.task.datetime, now)
}

export function scheduleDetailForPostedTaskRow(
  row: PostedTaskRow,
): string | null {
  return formatTaskScheduleLabel(row.task.datetime)
}

export function postedTaskScheduleDateKey(row: PostedTaskRow): string | null {
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

export function postedTaskRowOnDate(
  row: PostedTaskRow,
  dateKey: string,
): boolean {
  return postedTaskScheduleDateKey(row) === dateKey
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

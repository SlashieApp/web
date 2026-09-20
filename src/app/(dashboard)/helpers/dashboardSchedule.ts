import { TaskDateTimeType } from '@codegen/schema'

import type { TaskItem } from '@/utils/dashboardHelpers'
import { type ScheduleChip, scheduleChipForTask } from '@/utils/taskJobSchedule'

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formatDayKey(when: Date): string {
  return `${when.getFullYear()}-${when.getMonth()}-${when.getDate()}`
}

export function formatDayGroupLabel(
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

export function formatEventTimeLabel(
  task: TaskItem,
  when: Date | null,
): string {
  if (!when) {
    if (task.datetime?.type === TaskDateTimeType.Flexible) return 'Flexible'
    return 'Time TBC'
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(when)
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

export function groupUpcomingEvents<
  T extends { dayGroupKey: string; dayGroupLabel: string },
>(events: readonly T[]): { label: string; events: T[] }[] {
  const groups = new Map<string, T[]>()

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

export type { ScheduleChip }

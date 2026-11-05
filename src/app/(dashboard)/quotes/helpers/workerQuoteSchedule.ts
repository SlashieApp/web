import { TaskDateTimeType } from '@codegen/schema'

import type { TaskItem } from '@/utils/dashboardHelpers'
import {
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'

import { formatEventTimeLabel } from '../../helpers/dashboardSchedule'

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

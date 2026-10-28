import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { buildSearchUrl } from '@/app/(task)/search/helpers/searchQueryParams'
import type { OrderItem } from '@/utils/orderHelpers'
import type { TaskDatetimeLike } from '@/utils/taskJobSchedule'

import {
  type TaskDetailRecord,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailMapCoordinates,
} from './taskDetailUtils'

export type TaskDetailTimeTagCopy = {
  today: string
  tomorrow: string
  flexible: string
}

export type TaskDetailOwnerTag = {
  name: string
  avatarUrl: string | null
  href: string
}

export type TaskDetailLinkTag = {
  label: string
  href: string | null
}

const CLOCK_TIME = /^\d{1,2}:\d{2}/
const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i
const PLACE_NOISE =
  /^(united kingdom|uk|great britain|england|scotland|wales|northern ireland|greater london)$/i
const STREET_LINE =
  /^(?:\d+\b.*|.*\b(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|way|close|court|ct\.?|gardens|place|crescent|terrace|square)\b.*)$/i

/** Town (city) from a Mapbox place line or street address. */
export function taskDetailLocationTown(label: string): string {
  const parts = label
    .split(',')
    .map((part) => part.replace(UK_POSTCODE, '').replace(/\s+/g, ' ').trim())
    .filter((part) => part && !PLACE_NOISE.test(part))
  const places = parts.filter((part) => !STREET_LINE.test(part))
  return (places.at(-1) ?? parts.at(-1) ?? label).trim()
}

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Location chip: the town only, linking to search centred on the task pin.
 */
export function taskDetailLocationTag(input: {
  task: TaskDetailRecord
  myOrder?: OrderItem | null
  showExactLocation: boolean
}): TaskDetailLinkTag | null {
  const label = taskDetailLocationTown(taskDetailLocationLabel(input))
  if (!label) return null
  const coords = taskDetailMapCoordinates(
    input.task,
    input.myOrder,
    input.showExactLocation,
  )
  return {
    label,
    href: coords ? buildSearchUrl({ lat: coords.lat, lng: coords.lng }) : null,
  }
}

/**
 * Calendar chip: Today, Tomorrow, or a short local date.
 * Flexible when the task has a schedule type but no date.
 */
export function taskDetailTimeTag(
  task: { datetime?: TaskDatetimeLike | null },
  copy: TaskDetailTimeTagCopy,
  now = new Date(),
  locale = 'en-GB',
  bookedStart?: string | null,
): string | null {
  // A booking's start wins over the requested date (FE-324).
  const booked = bookedStart ? new Date(bookedStart) : null
  let day: Date
  if (booked && !Number.isNaN(booked.getTime())) {
    day = booked
  } else {
    const datePart = task.datetime?.date?.trim()
    if (!datePart) {
      return task.datetime ? copy.flexible : null
    }
    day = new Date(`${datePart}T12:00:00`)
    if (Number.isNaN(day.getTime())) return copy.flexible
  }

  const dayMs = 24 * 60 * 60 * 1000
  const taskDay = startOfLocalDay(day)
  const today = startOfLocalDay(now)
  if (taskDay === today) return copy.today
  if (taskDay === today + dayMs) return copy.tomorrow
  return day.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Duration chip. Tasks do not store a duration field — only a free-text
 * `datetime.time` that is not a clock time counts (clock times stay off
 * this chip).
 */
export function taskDetailDurationTag(
  task: Pick<TaskDetailRecord, 'datetime'>,
): string | null {
  const time = task.datetime?.time?.trim()
  if (!time || CLOCK_TIME.test(time)) return null
  return time
}

/**
 * Every category as a chip (FE-258), each linking to search for it. Tasks
 * without API categories fall back to the title heuristic.
 */
export function taskDetailCategoryChips(
  task: Pick<TaskDetailRecord, 'title' | 'description' | 'categories'>,
): TaskDetailLinkTag[] {
  const categories = (task.categories ?? [])
    .map((category) => category.trim())
    .filter(Boolean)
  if (categories.length === 0) {
    const label = taskCategoryLabel(task)?.trim()
    return label ? [{ label, href: null }] : []
  }
  return categories.map((category) => ({
    label: taskCategoryDisplayLabel(category) ?? category,
    href: buildSearchUrl({ taskCategory: category }),
  }))
}

export type TaskDetailTimeChipCopy = TaskDetailTimeTagCopy & {
  /** "By {date}" for a BEFORE schedule. */
  byDate: string
  startsInHours: string
  startsInMinutes: string
}

export type TaskDetailTimeChip = {
  label: string
  tone: 'neutral' | 'success' | 'warning'
  /** "Starts in 5 h" within 48 h of a known start time. */
  countdown: string | null
}

const HOUR_MS = 60 * 60 * 1000

/**
 * Time chip for the Task details card: Flexible, or the date plus the start
 * time. Success tone today, warning within 24 h of a known start.
 */
export function taskDetailTimeChip(
  task: { datetime?: TaskDatetimeLike | null },
  copy: TaskDetailTimeChipCopy,
  now = new Date(),
  locale = 'en-GB',
): TaskDetailTimeChip {
  const day = taskDetailTimeTag(task, copy, now, locale)
  const datePart = task.datetime?.date?.trim()
  if (!day || !datePart || day === copy.flexible) {
    return { label: copy.flexible, tone: 'neutral', countdown: null }
  }
  const clock = task.datetime?.time?.trim().match(CLOCK_TIME)?.[0] ?? null
  const dayLabel =
    task.datetime?.type === 'BEFORE' ? copy.byDate.replace('{date}', day) : day
  const start = clock
    ? new Date(`${datePart}T${clock.padStart(5, '0')}:00`)
    : null
  const untilStart =
    start && !Number.isNaN(start.getTime())
      ? start.getTime() - now.getTime()
      : null
  const upcoming = untilStart != null && untilStart > 0
  const countdown =
    upcoming && untilStart <= 48 * HOUR_MS
      ? untilStart < HOUR_MS
        ? copy.startsInMinutes.replace(
            '{count}',
            String(Math.max(1, Math.ceil(untilStart / 60_000))),
          )
        : copy.startsInHours.replace(
            '{count}',
            String(Math.round(untilStart / HOUR_MS)),
          )
      : null
  return {
    label: clock ? `${dayLabel} · ${clock}` : dayLabel,
    tone:
      day === copy.today
        ? 'success'
        : upcoming && untilStart <= 24 * HOUR_MS
          ? 'warning'
          : 'neutral',
    countdown,
  }
}

/** Owner chip. Public presence lives at `/profile/[userId]`. */
export function taskDetailOwnerTag(
  task: Pick<TaskDetailRecord, 'poster'>,
  fallbackName: string,
): TaskDetailOwnerTag | null {
  if (!task.poster) return null
  const name = task.poster.profile?.name?.trim() || fallbackName
  const avatarUrl = task.poster.profile?.avatarUrl?.trim() || null
  return { name, avatarUrl, href: `/profile/${task.poster.id}` }
}

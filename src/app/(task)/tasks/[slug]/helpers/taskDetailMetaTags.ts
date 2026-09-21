import { TASK_CREATE_CATEGORY_VALUES } from '@/app/(task)/helpers/taskCategories'
import { buildSearchUrl } from '@/app/(task)/search/helpers/searchQueryParams'
import type { OrderItem } from '@/utils/orderHelpers'

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
  const coords = taskDetailMapCoordinates(input.task, input.myOrder)
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
  task: Pick<TaskDetailRecord, 'datetime'>,
  copy: TaskDetailTimeTagCopy,
  now = new Date(),
  locale = 'en-GB',
): string | null {
  const datePart = task.datetime?.date?.trim()
  if (!datePart) {
    return task.datetime ? copy.flexible : null
  }
  const day = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(day.getTime())) return copy.flexible

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

/** Category chip. Links to search filtered by a known category code. */
export function taskDetailCategoryTag(
  task: Pick<TaskDetailRecord, 'title' | 'description' | 'category'>,
): TaskDetailLinkTag | null {
  const label = taskCategoryLabel(task)?.trim()
  if (!label) return null
  const code = task.category?.trim().toUpperCase().replace(/\s+/g, '_')
  const known = TASK_CREATE_CATEGORY_VALUES.find((value) => value === code)
  return {
    label,
    href: known ? buildSearchUrl({ taskCategory: known }) : null,
  }
}

/** Owner chip. Profile route is not built yet — `/user/:id` is a placeholder. */
export function taskDetailOwnerTag(
  task: Pick<TaskDetailRecord, 'poster'>,
  fallbackName: string,
): TaskDetailOwnerTag | null {
  if (!task.poster) return null
  const name = task.poster.profile?.name?.trim() || fallbackName
  const avatarUrl = task.poster.profile?.avatarUrl?.trim() || null
  return { name, avatarUrl, href: `/user/${task.poster.id}` }
}

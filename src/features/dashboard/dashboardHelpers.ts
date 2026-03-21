'use client'

import type { TasksQueryData } from '@/graphql/tasks-query.types'

export type TaskItem = TasksQueryData['tasks']['items'][number]
export type TaskOfferItem = TaskItem['offers'][number]
export type MyOfferItem = {
  task: TaskItem
  offer: TaskOfferItem
}

export function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

export function timeFromUnknown(value: unknown): number {
  const d =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : null

  return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0
}

export function formatDate(iso: unknown) {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null

  if (!d || Number.isNaN(d.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function formatRelativePosted(iso: unknown): string {
  const ms = timeFromUnknown(iso)
  if (!ms) return 'Recently'

  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Posted just now'
  if (minutes < 60) return `Posted ${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Posted ${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Posted yesterday'
  if (days < 7) return `Posted ${days} days ago`

  return `Posted ${formatDate(iso)}`
}

export function isTaskCompleted(status: string) {
  return /complete|done|closed|paid|archived|finished|resolved/i.test(
    status.trim(),
  )
}

export function isOfferAwarded(status: string) {
  return /accept|award|select|win|approved|chosen/i.test(status.trim())
}

export function matchesSearch(task: TaskItem, q: string) {
  const search = q.trim().toLowerCase()
  if (!search) return true

  return (
    task.title.toLowerCase().includes(search) ||
    (task.description ?? '').toLowerCase().includes(search) ||
    (task.location ?? '').toLowerCase().includes(search) ||
    (task.category ?? '').toLowerCase().includes(search)
  )
}

export function getOfferRange(offers: Array<{ pricePence: number }>) {
  if (offers.length === 0) return null

  const prices = offers.map((offer) => offer.pricePence)
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return min === max
    ? formatPounds(min)
    : `${formatPounds(min)}–${formatPounds(max)}`
}

export function getCategoryVisual(category: string | null | undefined) {
  const key = (category ?? '').toLowerCase()

  if (key.includes('plumb') || key.includes('water')) {
    return {
      glyph: '🏠',
      bg: 'linear-gradient(135deg, #d9e6ff 0%, #b5ceff 100%)',
    }
  }

  if (key.includes('electr')) {
    return {
      glyph: '🔌',
      bg: 'linear-gradient(135deg, #dfe8f7 0%, #8fb4ff 100%)',
    }
  }

  if (key.includes('paint') || key.includes('decor')) {
    return {
      glyph: '🎨',
      bg: 'linear-gradient(135deg, #fff4e4 0%, #ffddb8 100%)',
    }
  }

  if (key.includes('heat') || key.includes('hvac')) {
    return {
      glyph: '🌡️',
      bg: 'linear-gradient(135deg, #e8fff3 0%, #b2f5d6 100%)',
    }
  }

  return {
    glyph: '🔧',
    bg: 'linear-gradient(135deg, #eef4ff 0%, #dfe8f7 100%)',
  }
}

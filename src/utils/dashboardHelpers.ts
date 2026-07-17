'use client'

import type { MyRequestsQueryData } from '@/graphql/tasks-query.types'
import { budgetToPence, priceToPence } from '@/utils/price'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

export function getDisplayNameFromEmail(email: string | null | undefined) {
  const localPart = (email ?? '').split('@')[0]?.trim()
  if (!localPart) return 'Slashie member'

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ')
}

export type TaskItem = NonNullable<
  NonNullable<MyRequestsQueryData['me']>['tasksPosted']
>[number]
export type TaskQuoteItem = NonNullable<TaskItem['quotes']>[number]
export type MyQuoteItem = {
  task: TaskItem
  quote: TaskQuoteItem
}

export function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

export function quotePricePence(quote: { price?: { amount: number } | null }) {
  return priceToPence(quote.price) ?? 0
}

export function taskBudgetPence(task: { budget?: { amount: number } | null }) {
  return budgetToPence(task.budget) ?? 0
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

/** Compact relative time without the “Posted” prefix (e.g. `1 day ago`). */
export function formatRelativeAgo(iso: unknown): string {
  return formatRelativePosted(iso).replace(/^Posted /, '')
}

export function isTaskCompleted(status: string) {
  return /complete|done|closed|paid|archived|finished|resolved/i.test(
    status.trim(),
  )
}

export function isQuoteAwarded(status: string) {
  return /accept|award|select|win|approved|chosen/i.test(status.trim())
}

export function matchesSearch(task: TaskItem, q: string) {
  const search = q.trim().toLowerCase()
  if (!search) return true

  return (
    task.title.toLowerCase().includes(search) ||
    (task.description ?? '').toLowerCase().includes(search) ||
    taskPublicLocationLabel(task).toLowerCase().includes(search)
  )
}

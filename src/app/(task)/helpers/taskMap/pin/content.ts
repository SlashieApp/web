import type { TaskMapTask } from '../types'

/** Price for the always-visible pill; falls back to detailLine before `·`. */
export function pinPriceText(task: TaskMapTask): string {
  const p = task.priceLabel?.trim()
  if (p) return p
  const line = (task.detailLine ?? '').trim()
  if (!line) return '—'
  const head = line.split('·')[0]?.trim()
  return head || line
}

/** Distance from search reference (e.g. "2.1 mi away"). */
export function pinMilesText(task: TaskMapTask): string {
  const d = task.distanceLabel?.trim()
  if (d) return d
  return '—'
}

/** Initials for `person` pin avatar fallback (from the pin title). */
export function pinAvatarInitials(task: TaskMapTask): string {
  return (
    task.title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('') || 'W'
  )
}

/** Stable signature for pin popup content (excluding coordinates). */
export function taskPinContentSig(task: TaskMapTask): string {
  return [
    pinPriceText(task),
    pinMilesText(task),
    task.pinKind ?? 'price',
    task.avatarUrl ?? '',
  ].join('\x1f')
}

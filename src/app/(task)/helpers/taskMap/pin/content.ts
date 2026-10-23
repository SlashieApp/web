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

/**
 * Distance from search reference (e.g. "2.1 mi away"). Null without a
 * reference location, so the popup shows the price alone.
 */
export function pinMilesText(task: TaskMapTask): string | null {
  return task.distanceLabel?.trim() || null
}

/**
 * Accessible label for a task pin. The first tap on a pin selects its task, so
 * the label only says what the pin is. Once the task is selected another tap
 * opens it, and the label says so.
 */
export function pinAriaLabel(task: TaskMapTask, selected = false): string {
  const miles = pinMilesText(task)
  const summary = miles ? `${pinPriceText(task)}, ${miles}` : pinPriceText(task)
  return selected ? `${summary}. View task details.` : summary
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
    pinMilesText(task) ?? '',
    task.pinKind ?? 'price',
    task.avatarUrl ?? '',
  ].join('\x1f')
}

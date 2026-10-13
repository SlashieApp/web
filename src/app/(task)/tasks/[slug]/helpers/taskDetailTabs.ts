export const TASK_DETAIL_TAB = {
  overview: 'overview',
} as const

export type TaskDetailTab =
  (typeof TASK_DETAIL_TAB)[keyof typeof TASK_DETAIL_TAB]

const TAB_VALUES = new Set<string>(Object.values(TASK_DETAIL_TAB))

/** Old Analytics tab links: the owner card (desktop) or drawer (phones). */
export const TASK_ANALYTICS_HASHES = new Set([
  'analytics',
  'owner-task-performance',
])

/**
 * Hashes that open Overview: booking / complete-job anchors, the retired
 * `#activity`, and `#quotes` / `#analytics` (Overview sections since FE-258).
 */
const OVERVIEW_ANCHOR_HASHES = new Set([
  'activity',
  'quotes',
  'task-order',
  'worker-job-panel',
  ...TASK_ANALYTICS_HASHES,
])

export function isTaskDetailTab(value: string): value is TaskDetailTab {
  return TAB_VALUES.has(value)
}

export function readTaskDetailHash(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hash.replace('#', '')
}

/**
 * Map a URL hash to a task-detail tab. `#info` stays as an alias for Overview.
 * Booking/complete anchors (and the retired `#activity` hash) open Overview.
 */
export function resolveTaskDetailTab(
  hash: string,
  fallback: TaskDetailTab,
): TaskDetailTab {
  const key = hash.replace('#', '').trim()
  if (key === 'info' || key === 'overview') return TASK_DETAIL_TAB.overview
  if (OVERVIEW_ANCHOR_HASHES.has(key)) return TASK_DETAIL_TAB.overview
  if (isTaskDetailTab(key)) return key
  return fallback
}

/**
 * MVP is one accepted worker. After a quote is accepted the Quotes section is
 * retired; the agreement lives on the Booking / Order card.
 */
export function showTaskDetailQuotesSection(input: {
  isOpen: boolean
  isAwarded: boolean
  isClosed: boolean
  isCancelled: boolean
  atCap: boolean
}): boolean {
  if (!input.isOpen || input.isAwarded || input.atCap) return false
  if (input.isClosed && !input.isCancelled) return false
  return true
}

export function writeTaskDetailHash(hash: string) {
  if (typeof window === 'undefined') return
  const next = hash.startsWith('#') ? hash : `#${hash}`
  if (window.location.hash === next) return
  window.history.replaceState(null, '', next)
}

export const TASK_DETAIL_TAB = {
  overview: 'overview',
  quotes: 'quotes',
  analytics: 'analytics',
} as const

export type TaskDetailTab =
  (typeof TASK_DETAIL_TAB)[keyof typeof TASK_DETAIL_TAB]

const TAB_VALUES = new Set<string>(Object.values(TASK_DETAIL_TAB))

/** Hashes that scroll Overview to booking / complete-job anchors. */
const OVERVIEW_ANCHOR_HASHES = new Set([
  'activity',
  'task-order',
  'worker-job-panel',
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
  if (key === 'quotes') return TASK_DETAIL_TAB.quotes
  if (key === 'analytics' || key === 'owner-task-performance') {
    return TASK_DETAIL_TAB.analytics
  }
  if (OVERVIEW_ANCHOR_HASHES.has(key)) return TASK_DETAIL_TAB.overview
  if (isTaskDetailTab(key)) return key
  return fallback
}

export function defaultTaskDetailTab(input: {
  isOwner: boolean
  isOpen: boolean
  isAwarded: boolean
  isOrderWorker: boolean
  quoteCount: number
}): TaskDetailTab {
  if (input.isAwarded && (input.isOwner || input.isOrderWorker)) {
    return TASK_DETAIL_TAB.overview
  }
  if (input.isOwner && input.isOpen && input.quoteCount > 0) {
    return TASK_DETAIL_TAB.quotes
  }
  return TASK_DETAIL_TAB.overview
}

export function writeTaskDetailHash(hash: string) {
  if (typeof window === 'undefined') return
  const next = hash.startsWith('#') ? hash : `#${hash}`
  if (window.location.hash === next) return
  window.history.replaceState(null, '', next)
}

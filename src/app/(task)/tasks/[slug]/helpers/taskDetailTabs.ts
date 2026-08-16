export const TASK_DETAIL_TABS = [
  'overview',
  'details',
  'quotes',
  'activity',
] as const

export type TaskDetailTab = (typeof TASK_DETAIL_TABS)[number]

const TAB_SET = new Set<string>(TASK_DETAIL_TABS)

/** Legacy `#info` from the previous Info | Quotes mobile tabs. */
const HASH_ALIASES: Record<string, TaskDetailTab> = {
  info: 'overview',
}

export function isTaskDetailTab(value: string): value is TaskDetailTab {
  return TAB_SET.has(value)
}

export function parseTaskDetailTabHash(
  hash: string | null | undefined,
): TaskDetailTab | null {
  const key = (hash ?? '').replace(/^#/, '').trim().toLowerCase()
  if (!key) return null
  if (isTaskDetailTab(key)) return key
  return HASH_ALIASES[key] ?? null
}

export function readTaskDetailTabFromLocation(): TaskDetailTab | null {
  if (typeof window === 'undefined') return null
  return parseTaskDetailTabHash(window.location.hash)
}

export function replaceTaskDetailTabHash(tab: TaskDetailTab) {
  if (typeof window === 'undefined') return
  const url = `${window.location.pathname}${window.location.search}#${tab}`
  window.history.replaceState(null, '', url)
}

export function defaultTaskDetailTab(input: {
  isOwner: boolean
  quoteCount: number
}): TaskDetailTab {
  return input.isOwner && input.quoteCount > 0 ? 'quotes' : 'overview'
}

import { stripLocalePrefix } from '@/i18n/navigation'

/**
 * True for the public task-detail route `/tasks/[slug]` only — not edit,
 * quote, create, or the `/tasks` index.
 */
const RESERVED_TASK_SLUGS = new Set(['create', 'edit'])

export function isTaskDetailPath(pathname: string | null | undefined): boolean {
  const bare = stripLocalePrefix(pathname ?? '')
  const match = bare.match(/^\/tasks\/([^/]+)$/)
  if (!match) return false
  return !RESERVED_TASK_SLUGS.has(match[1] ?? '')
}

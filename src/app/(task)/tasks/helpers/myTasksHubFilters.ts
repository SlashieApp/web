import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'

import type { MyTaskHubSection, MyTaskRole } from './myTasksHub'

/** What `/tasks` is narrowed by, kept in the URL. Empty means "all". */
export type MyTasksQuery = {
  /** Title, description and place (`TaskFilter.search`). */
  q: string
  /** Category code (`TaskFilter.category`). */
  category: string
  /** Tasks I posted or tasks I quoted on (narrowed here, not by the API). */
  role: MyTaskRole | ''
}

export const EMPTY_MY_TASKS_QUERY: MyTasksQuery = {
  q: '',
  category: '',
  role: '',
}

export function parseMyTasksQuery(params: {
  get(name: string): string | null
}): MyTasksQuery {
  const role = params.get('role')
  return {
    q: params.get('q')?.trim() ?? '',
    category: params.get('category')?.trim() ?? '',
    role: role === 'hosted' || role === 'quoted' ? role : '',
  }
}

/** `?q=…&category=…&role=…` without the empty ones; '' when nothing is set. */
export function myTasksQueryString(query: MyTasksQuery): string {
  const params = new URLSearchParams()
  if (query.q.trim()) params.set('q', query.q.trim())
  if (query.category) params.set('category', query.category)
  if (query.role) params.set('role', query.role)
  const text = params.toString()
  return text ? `?${text}` : ''
}

/** How many of search, category and Hosted / Quoted are set (the filter button's count). */
export function activeFilterCount(query: MyTasksQuery): number {
  return [query.q.trim(), query.category, query.role].filter(Boolean).length
}

/** Keeps the rows with this role in every section. */
export function filterHubByRole(
  sections: readonly MyTaskHubSection[],
  role: MyTaskRole | '',
): MyTaskHubSection[] {
  if (!role) return [...sections]
  return sections.map((section) => ({
    ...section,
    rows: section.rows.filter((row) => row.roles.includes(role)),
  }))
}

/** The Hosted / Quoted filter only helps someone with both kinds of task. */
export function hubHasBothRoles(
  sections: readonly MyTaskHubSection[],
): boolean {
  const rows = sections.flatMap((section) => section.rows)
  return (
    rows.some((row) => row.roles.includes('hosted')) &&
    rows.some((row) => row.roles.includes('quoted'))
  )
}

export function countHubRows(sections: readonly MyTaskHubSection[]): number {
  return sections.reduce((sum, section) => sum + section.rows.length, 0)
}

/** Labels for `me.hubTaskCategories` codes. Duplicates are dropped. */
export function hubCategoryOptions(
  codes: readonly string[],
): { category: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const code of codes) {
    const category = code.trim()
    if (!category || seen.has(category)) continue
    seen.set(category, taskCategoryDisplayLabel(category) ?? category)
  }
  return [...seen.entries()]
    .map(([category, label]) => ({ category, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

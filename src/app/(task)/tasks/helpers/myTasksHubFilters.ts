import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'

import type { MyTaskHubSection, MyTaskSectionId } from './myTasksHub'

/**
 * Hub narrow values from BE-61 `filter.hubSection`.
 * Applied on the loaded hub until that input exists on `TaskFilter`.
 */
export const HUB_SECTION_FILTERS = ['OPEN', 'BOOKED', 'COMPLETED'] as const

export type HubSectionFilter = (typeof HUB_SECTION_FILTERS)[number]

/** BE-61 field names. Empty strings mean "all". */
export type MyTasksHubFilter = {
  /** Title, description, and place (`TaskFilter.search`). */
  search?: string
  /** Task poster (`filter.ownerUserId`). */
  ownerUserId?: string
  /** Category code (`filter.category`). */
  category?: string
  hubSection?: HubSectionFilter | ''
}

const SECTION_BY_FILTER: Record<HubSectionFilter, MyTaskSectionId> = {
  OPEN: 'open',
  BOOKED: 'booked',
  COMPLETED: 'completed',
}

export function isHubFilterActive(filter: MyTasksHubFilter): boolean {
  return Boolean(
    filter.search?.trim() ||
      filter.ownerUserId?.trim() ||
      filter.category?.trim() ||
      filter.hubSection,
  )
}

function searchTokens(search: string | undefined): string[] {
  return (search ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean)
}

/**
 * Narrow Open / Booked / Completed without flattening the section IA.
 * Search matches title, description, and place (same contract as `filter.search`).
 */
export function applyMyTasksHubFilter(
  sections: readonly MyTaskHubSection[],
  filter: MyTasksHubFilter,
): MyTaskHubSection[] {
  const tokens = searchTokens(filter.search)
  const ownerUserId = filter.ownerUserId?.trim() || ''
  const category = filter.category?.trim() || ''
  const sectionId = filter.hubSection
    ? SECTION_BY_FILTER[filter.hubSection]
    : null

  return sections.flatMap((section) => {
    if (sectionId && section.id !== sectionId) return []
    const rows = section.rows.filter((row) => {
      if (ownerUserId && row.ownerUserId !== ownerUserId) return false
      if (category && row.category !== category) return false
      if (tokens.length === 0) return true
      const haystack = [row.title, row.description, row.location]
        .join('\n')
        .toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
    return rows.length > 0 ? [{ id: section.id, rows }] : []
  })
}

export function countHubRows(sections: readonly MyTaskHubSection[]): number {
  return sections.reduce((sum, section) => sum + section.rows.length, 0)
}

/** Distinct categories on the viewer's hub (`User.hubTaskCategories` equivalent). */
export function collectHubTaskCategories(
  sections: readonly MyTaskHubSection[],
): { category: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const section of sections) {
    for (const row of section.rows) {
      const category = row.category?.trim()
      if (!category || seen.has(category)) continue
      seen.set(category, taskCategoryDisplayLabel(category) ?? category)
    }
  }
  return [...seen.entries()]
    .map(([category, label]) => ({ category, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Distinct task posters. `label` is the poster name, or empty when unknown
 * (the UI supplies "You" for the viewer).
 */
export function collectHubOwners(
  sections: readonly MyTaskHubSection[],
  viewerId: string | null | undefined,
): { ownerUserId: string; label: string }[] {
  const byId = new Map<string, string>()
  for (const section of sections) {
    for (const row of section.rows) {
      const ownerUserId = row.ownerUserId.trim()
      if (!ownerUserId) continue
      const name = row.ownerName?.trim() || ''
      if (name) {
        byId.set(ownerUserId, name)
        continue
      }
      if (!byId.has(ownerUserId)) byId.set(ownerUserId, '')
    }
  }
  const viewer = viewerId?.trim() || ''
  return [...byId.entries()]
    .map(([ownerUserId, label]) => ({ ownerUserId, label }))
    .sort((a, b) => {
      if (viewer && a.ownerUserId === viewer) return -1
      if (viewer && b.ownerUserId === viewer) return 1
      if (!a.label && b.label) return 1
      if (a.label && !b.label) return -1
      return a.label.localeCompare(b.label)
    })
}

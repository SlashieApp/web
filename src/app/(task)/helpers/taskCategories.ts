import { z } from 'zod'

/**
 * Canonical task category codes sent with `createTask`. Keep aligned with the API;
 * legacy tasks may surface other strings — use {@link taskCategoryDisplayLabel}.
 */
export const TASK_CREATE_CATEGORY_VALUES = [
  'GENERAL',
  'DELIVERY',
  'HANDYMAN',
  'TECH_SETUP',
  'CLEANING',
  'MOVING',
] as const

export type TaskCreateCategoryValue =
  (typeof TASK_CREATE_CATEGORY_VALUES)[number]

const LABELS = {
  GENERAL: 'General / other',
  DELIVERY: 'Delivery',
  HANDYMAN: 'Handyman',
  TECH_SETUP: 'Tech setup',
  CLEANING: 'Cleaning',
  MOVING: 'Moving',
} as const satisfies Record<TaskCreateCategoryValue, string>

export const TASK_CREATE_CATEGORY_OPTIONS = TASK_CREATE_CATEGORY_VALUES.map(
  (value) => ({
    value,
    label: LABELS[value],
  }),
)

/** Zod helper for task create/edit forms */
export const taskCreateCategorySchema = z.enum(TASK_CREATE_CATEGORY_VALUES)

/** Human-readable label for API category strings */
export function taskCategoryDisplayLabel(
  category: string | null | undefined,
): string | null {
  if (!category?.trim()) return null
  const key = category.trim().toUpperCase().replace(/\s+/g, '_')
  if (key in LABELS) return LABELS[key as TaskCreateCategoryValue]
  const trimmed = category.trim()
  // Legacy codes (SOME_CODE) read as words; open strings (BE-79) stay as typed.
  if (!/^[A-Z0-9_]+$/.test(trimmed)) return trimmed
  return trimmed
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Labels for a task's categories (BE-79: open strings; legacy codes read nicely). */
export function taskCategoryLabels(
  categories: readonly string[] | null | undefined,
): string[] {
  return (categories ?? [])
    .map((category) => taskCategoryDisplayLabel(category))
    .filter((label): label is string => Boolean(label))
}

/** One line for tight spots: "Cleaning", or "Cleaning, Moving +1" with `max` 2. */
export function taskCategoriesSummary(
  categories: readonly string[] | null | undefined,
  max = 1,
): string | null {
  const labels = taskCategoryLabels(categories)
  if (labels.length === 0) return null
  const shown = labels.slice(0, max).join(', ')
  return labels.length > max ? `${shown} +${labels.length - max}` : shown
}

/** BE-79 limits, mirrored so the form says so before the API does. */
export const TASK_CATEGORIES_MAX = 10
export const TASK_CATEGORY_MAX_CHARS = 64

/** Offered until real tasks make `popularTaskCategories` useful. */
export const STARTER_TASK_CATEGORIES: readonly string[] = [
  'Cleaning',
  'Moving',
  'Repairs',
  'Plumbing',
  'Electrical',
  'Gardening',
  'Painting',
  'Assembly',
]

/** Trim and collapse inner spaces, as the API does. */
export function normaliseTaskCategory(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export type AddTaskCategoryResult = {
  categories: string[]
  error?: 'tooMany' | 'tooLong'
}

/**
 * Add a typed or suggested category. Comma-separated input adds several.
 * Duplicates (ignoring case) and blanks are skipped, like the API.
 */
export function addTaskCategories(
  current: readonly string[],
  raw: string,
): AddTaskCategoryResult {
  const next = [...current]
  const seen = new Set(next.map((c) => c.toLowerCase()))
  for (const part of raw.split(',')) {
    const category = normaliseTaskCategory(part)
    if (!category || seen.has(category.toLowerCase())) continue
    if (category.length > TASK_CATEGORY_MAX_CHARS) {
      return { categories: next, error: 'tooLong' }
    }
    if (next.length >= TASK_CATEGORIES_MAX) {
      return { categories: next, error: 'tooMany' }
    }
    next.push(category)
    seen.add(category.toLowerCase())
  }
  return { categories: next }
}

/** Popular categories first, then the starter list; none already added. */
export function suggestedTaskCategories(
  popular: readonly string[],
  added: readonly string[],
  limit = 12,
): string[] {
  const seen = new Set(added.map((c) => c.toLowerCase()))
  const out: string[] = []
  for (const raw of [...popular, ...STARTER_TASK_CATEGORIES]) {
    const category = normaliseTaskCategory(raw)
    const key = category.toLowerCase()
    if (!category || seen.has(key)) continue
    seen.add(key)
    out.push(category)
    if (out.length >= limit) break
  }
  return out
}

/** Form field: 1 to 10 categories, each up to 64 characters. */
export const taskCategoriesSchema = z
  .array(z.string().trim().min(1).max(TASK_CATEGORY_MAX_CHARS))
  .min(1, 'Add at least one category.')
  .max(TASK_CATEGORIES_MAX, `Up to ${TASK_CATEGORIES_MAX} categories.`)

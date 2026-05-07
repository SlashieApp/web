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
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

import type { TaskCategory } from '@codegen/schema'

/** Title-case label for `TaskCategory` enum values in UI copy. */
export function formatTaskCategoryLabel(category: TaskCategory): string {
  return category
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

/** Human-readable label for `TaskContactMethod` stored as a string on `Task`. */
export function formatTaskContactMethodLabel(method: string): string {
  const key = method.trim().toUpperCase().replaceAll(' ', '_')
  if (key === 'PHONE') return 'Phone'
  if (key === 'EMAIL') return 'Email'
  if (key === 'IN_APP') return 'In app'
  return method
}

/** Public-facing place line for lists and maps (address omitted when API hides it). */
export function taskPublicLocationLabel(task: {
  locationName?: string | null
  location?: { name?: string | null } | null
  address?: string | null
}): string {
  const fromName =
    task.locationName?.trim() || task.location?.name?.trim() || ''
  if (fromName) return fromName
  return task.address?.trim() || ''
}

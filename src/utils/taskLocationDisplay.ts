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
  location?: { name?: string | null; address?: string | null } | null
}): string {
  const fromName = task.location?.name?.trim() || ''
  if (fromName) return fromName
  return task.location?.address?.trim() || ''
}

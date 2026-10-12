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

const UK_POSTCODE_RE = /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i

/**
 * What non-participants see for a stored place name: the first comma
 * segment without a postcode (same trim as the API's discovery label).
 */
export function publicAreaFromName(name: string | null | undefined): string {
  const first = (name ?? '').split(',')[0] ?? ''
  return first
    .replace(UK_POSTCODE_RE, '')
    .replace(/[,\s]+$/g, '')
    .trim()
}

/**
 * Fallback when the area lookup fails: drops comma segments with digits
 * (house numbers, postcodes), so no street number is stored publicly.
 */
export function stripStreetFromPlaceName(
  name: string | null | undefined,
): string {
  return (name ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/\d/.test(part))
    .join(', ')
}

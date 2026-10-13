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

// Mirrors apollo `townOnly` (src/utils/helpers.ts, BE-72): what anyone who
// isn't a participant sees for a place. Keep the two in step.
const UK_POSTCODE_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi
/** Postcode district on its own, e.g. "WD23" in "Bushey WD23". */
const UK_OUTWARD_CODE_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\b/gi
const COUNTRY_RE =
  /^(united kingdom|uk|great britain|gb|england|scotland|wales|northern ireland)$/i
/** Segment ends like a street ("High St", "Herkomer Road"). */
const STREET_RE =
  /\b(road|rd|street|st|lane|ln|avenue|ave|close|cl|drive|dr|way|crescent|cres|terrace|tce|mews|grove|gardens|gdns|court|ct|place|pl|square|sq|walk|row|parade|boulevard|blvd|hill|rise|view|vale|green|park)\.?$/i
/** Segment starts like a unit ("Flat 3", "Apartment B"). */
const UNIT_RE =
  /^(flat|apartment|apt|unit|suite|floor|room|block|building|house)\b/i

/**
 * Town or locality only: drops postcodes, the country, and every comma
 * segment with a digit, a unit or a street name, then returns the first
 * segment left (`"54 Herkomer Road, Bushey, WD23 3LU, United Kingdom"` gives
 * `"Bushey"`). Errs coarse: a town named like a street ("Burgess Hill") falls
 * through to the next segment. Takes candidates in order and returns the
 * first that has a town.
 */
export function townOnly(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    for (const raw of (candidate ?? '').split(',')) {
      const segment = raw
        .replace(/\(.*?\)/g, '')
        .replace(UK_POSTCODE_RE, '')
        .replace(UK_OUTWARD_CODE_RE, '')
        .trim()
        .replace(/\s+/g, ' ')
      if (
        !segment ||
        /\d/.test(segment) ||
        COUNTRY_RE.test(segment) ||
        STREET_RE.test(segment) ||
        UNIT_RE.test(segment)
      ) {
        continue
      }
      return segment
    }
  }
  return null
}

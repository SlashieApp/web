const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parse a `yyyy-mm-dd` value as a UTC calendar date. */
export function parseIsoDateOnly(value: string): Date | null {
  const match = ISO_DATE_ONLY.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

/** Whole years completed since a `yyyy-mm-dd` birth date. */
export function ageFromIsoDateOnly(
  value: string,
  now: Date = new Date(),
): number | null {
  const birth = parseIsoDateOnly(value)
  if (!birth) return null
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1
  }
  return age
}

export function isAtLeast18(value: string, now: Date = new Date()): boolean {
  const age = ageFromIsoDateOnly(value, now)
  return age !== null && age >= 18
}

import { parseSkillsText } from './workerSetupFormState'

/** Mirrors the BE caps: max 10 items, 2–40 chars each, case-insensitive dedupe. */
export const QUALIFICATIONS_MAX = 10
export const QUALIFICATION_MIN_CHARS = 2
export const QUALIFICATION_MAX_CHARS = 40

/** Common UK trade qualifications shown as one-tap chips. */
export const SUGGESTED_QUALIFICATIONS: readonly string[] = [
  'City & Guilds',
  'NICEIC',
  'Gas Safe',
  'NVQ',
  'CSCS Card',
  'Part P',
  'DBS Checked',
  'Fully Insured',
]

/**
 * Add free-text input to the qualification chips: splits on commas/new
 * lines, trims/collapses whitespace (typed capitalisation is preserved —
 * "NICEIC" stays "NICEIC"), dedupes case-insensitively, enforces caps.
 */
export function addQualifications(
  current: readonly string[],
  raw: string,
): string[] {
  const next = [...current]
  const seen = new Set(current.map((q) => q.toLowerCase()))
  for (const part of parseSkillsText(raw)) {
    if (next.length >= QUALIFICATIONS_MAX) break
    const label = part.trim().replace(/\s+/g, ' ')
    if (
      label.length < QUALIFICATION_MIN_CHARS ||
      label.length > QUALIFICATION_MAX_CHARS
    ) {
      continue
    }
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    next.push(label)
  }
  return next
}

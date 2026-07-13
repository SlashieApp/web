import { parseSkillsText } from './workerSetupFormState'

export const SKILLS_MIN = 3
export const SKILLS_MAX = 12
export const SKILL_LABEL_MIN_CHARS = 2
export const SKILL_LABEL_MAX_CHARS = 30

/**
 * Starter chips shown above the "add your own" input.
 * TODO(worker-setup-phase-3): seed these from the primary-category tiles when
 * that question lands (e.g. Handyman → assembly/mounting/shelving).
 */
export const SUGGESTED_SKILLS: readonly string[] = [
  'Furniture Assembly',
  'TV Mounting',
  'Shelving',
  'Door Repairs',
  'Flat-pack',
  'Painting',
  'Plumbing Repairs',
  'Electrical Fixes',
  'Garden Tidy-up',
  'Deep Cleaning',
  'Removals',
  'Tiling',
]

/**
 * Trim/collapse whitespace and title-case each word (existing capitals are
 * preserved, so "TV mounting" → "TV Mounting"). Returns null when the label
 * is outside the 2–30 char bounds.
 */
export function normalizeSkillLabel(raw: string): string | null {
  const collapsed = raw.trim().replace(/\s+/g, ' ')
  if (
    collapsed.length < SKILL_LABEL_MIN_CHARS ||
    collapsed.length > SKILL_LABEL_MAX_CHARS
  ) {
    return null
  }
  return collapsed
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Add free-text input to the selected skills: splits on commas/new lines,
 * normalizes each label, dedupes case-insensitively against what's already
 * selected, and enforces the 12-skill cap. Same string[] wire format.
 */
export function addSkills(current: readonly string[], raw: string): string[] {
  const next = [...current]
  const seen = new Set(current.map((s) => s.toLowerCase()))
  for (const part of parseSkillsText(raw)) {
    if (next.length >= SKILLS_MAX) break
    const label = normalizeSkillLabel(part)
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    next.push(label)
  }
  return next
}

export function removeSkill(
  current: readonly string[],
  skill: string,
): string[] {
  return current.filter((s) => s !== skill)
}

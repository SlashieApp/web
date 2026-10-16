import type { ChipRules } from './workerSetupChips'

/** Mirrors the API: at most 10, 2 to 40 characters each, kept as typed ("NICEIC"). */
export const QUALIFICATIONS_MAX = 10

export const QUALIFICATION_RULES: ChipRules = {
  max: QUALIFICATIONS_MAX,
  minChars: 2,
  maxChars: 40,
}

/** Common UK trade qualifications (names, so not translated). */
export const SUGGESTED_QUALIFICATIONS: readonly string[] = [
  'City & Guilds',
  'NICEIC',
  'Gas Safe',
  'NVQ',
  'CSCS Card',
  'Part P',
]

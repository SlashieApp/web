import type { ChipRules } from './workerSetupChips'

export const SKILLS_MIN = 3
export const SKILLS_MAX = 12

/** 2 to 30 characters each, title-cased. */
export const SKILL_RULES: ChipRules = {
  max: SKILLS_MAX,
  minChars: 2,
  maxChars: 30,
  titleCase: true,
}

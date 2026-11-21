import { TaskBudgetUnit } from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { formatBudgetAmount } from '@/utils/price'

import bag from './i11n.json'

/**
 * A task's budget, as every screen shows it (FE-584, BE-139; Ryan 21 Nov).
 * A task may have no budget (an open budget: workers quote their own price).
 * A priced task's unit is one the poster tapped (shown in the reader's
 * language) or their own words (shown as typed). A blank unit is a price for
 * the whole job, "Fixed price". The Expo app's `taskBudget.ts` reads the same.
 */
export const taskBudgetBag = bag
export type TaskBudgetCopy = (typeof bag)['en']

/** The units a poster can tap under the unit field, in this order. */
export const BUDGET_UNIT_SUGGESTIONS = [
  TaskBudgetUnit.PerHour,
  TaskBudgetUnit.PerDay,
  TaskBudgetUnit.PerWeek,
  TaskBudgetUnit.PerVisit,
  TaskBudgetUnit.PerItem,
] as const

export type BudgetUnitSuggestion = (typeof BUDGET_UNIT_SUGGESTIONS)[number]

/** The longest unit a poster may type: the API's limit (`INVALID_BUDGET_UNIT`). */
export const CUSTOM_UNIT_MAX = 30

/** A budget as the queries read it; older fragments may still carry `type`. */
export type TaskBudgetLike =
  | {
      amount: number
      currency?: string | null
      unit?: TaskBudgetUnit | string | null
      customUnit?: string | null
      type?: string | null
    }
  | null
  | undefined

const KNOWN_UNITS = new Set<string>(Object.values(TaskBudgetUnit))

/** True when the task has a price; false for an open budget. */
export function hasTaskBudget(
  budget: TaskBudgetLike,
): budget is NonNullable<TaskBudgetLike> {
  return (
    budget != null &&
    typeof budget.amount === 'number' &&
    Number.isFinite(budget.amount) &&
    budget.amount > 0
  )
}

/** What the amount is for: the unit, else the older `type` (hours, days, else the whole job). */
export function taskBudgetUnit(budget: TaskBudgetLike): TaskBudgetUnit {
  const unit = budget?.unit?.trim().toUpperCase()
  if (unit && KNOWN_UNITS.has(unit)) return unit as TaskBudgetUnit
  const type = budget?.type?.trim().toUpperCase().replaceAll(' ', '_')
  if (type === 'PER_HOUR') return TaskBudgetUnit.PerHour
  if (type === 'PER_DAY') return TaskBudgetUnit.PerDay
  return TaskBudgetUnit.Total
}

/** Trimmed, with runs of spaces made one: how the API stores the poster's words. */
export function normalizeUnitText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/** "£60": tasks are posted in pounds. */
function amountText(budget: NonNullable<TaskBudgetLike>): string {
  return formatBudgetAmount({
    amount: budget.amount,
    currency: budget.currency || 'GBP',
  })
}

/** The poster's own words, or null when the unit is a known one. */
export function taskBudgetCustomUnit(budget: TaskBudgetLike): string | null {
  if (taskBudgetUnit(budget) !== TaskBudgetUnit.Custom) return null
  return normalizeUnitText(budget?.customUnit ?? '') || null
}

/**
 * The small label beside the amount: "Fixed price", "Per day", or the poster's
 * own words as typed. Null for an open budget.
 */
export function taskBudgetUnitLabel(
  budget: TaskBudgetLike,
  copy: TaskBudgetCopy,
): string | null {
  if (!hasTaskBudget(budget)) return null
  const unit = taskBudgetUnit(budget)
  if (unit === TaskBudgetUnit.Custom) {
    return taskBudgetCustomUnit(budget) ?? copy.unit.TOTAL
  }
  return copy.unit[unit]
}

/** The amount and its small label, or "Open budget" with no label. */
export function taskBudgetPrice(
  budget: TaskBudgetLike,
  copy: TaskBudgetCopy,
): { open: boolean; amount: string; unitLabel: string | null } {
  if (!hasTaskBudget(budget)) {
    return { open: true, amount: copy.open, unitLabel: null }
  }
  return {
    open: false,
    amount: amountText(budget),
    unitLabel: taskBudgetUnitLabel(budget, copy),
  }
}

/**
 * An amount and its unit in a sentence: "£20 an hour", "£15 per room",
 * "£120". `amount` is already formatted.
 */
export function budgetPhrase(
  amount: string,
  { unit, customUnit }: { unit: TaskBudgetUnit; customUnit?: string | null },
  copy: TaskBudgetCopy,
): string {
  const custom = normalizeUnitText(customUnit ?? '')
  if (unit === TaskBudgetUnit.Custom && custom) {
    return formatMessage(copy.phrase.CUSTOM, { amount, unit: custom })
  }
  return formatMessage(
    copy.phrase[unit === TaskBudgetUnit.Custom ? TaskBudgetUnit.Total : unit],
    { amount },
  )
}

/**
 * The budget in a sentence: "£20 an hour", "£15 per room", "£120"; "Open
 * budget" when there is none.
 */
export function taskBudgetPhrase(
  budget: TaskBudgetLike,
  copy: TaskBudgetCopy,
): string {
  if (!hasTaskBudget(budget)) return copy.open
  return budgetPhrase(
    amountText(budget),
    { unit: taskBudgetUnit(budget), customUnit: taskBudgetCustomUnit(budget) },
    copy,
  )
}

/** The map pin: the amount alone, or "Open". */
export function taskBudgetPinLabel(
  budget: TaskBudgetLike,
  copy: TaskBudgetCopy,
): string {
  if (!hasTaskBudget(budget)) return copy.openShort
  return amountText(budget)
}

/** Lower-cased, one space: so "Per  Day" matches the "per day" suggestion. */
function unitKey(text: string): string {
  return normalizeUnitText(text).toLowerCase()
}

/**
 * Every word that means a known unit, in either language: the suggestions
 * and the labels (so "Per day", "按日" and "Fixed price" are read back).
 */
const UNIT_BY_TEXT: ReadonlyMap<string, TaskBudgetUnit> = (() => {
  const map = new Map<string, TaskBudgetUnit>()
  for (const copy of [bag.en, bag.zh_hk]) {
    for (const unit of BUDGET_UNIT_SUGGESTIONS) {
      map.set(unitKey(copy.suggestion[unit]), unit)
      map.set(unitKey(copy.unit[unit]), unit)
    }
    map.set(unitKey(copy.unit.TOTAL), TaskBudgetUnit.Total)
  }
  return map
})()

/**
 * The unit field's text as the API takes it: empty is the whole job, a
 * suggestion (in either language) is that unit, anything else is the
 * poster's own words.
 */
export function budgetUnitFromText(text: string): {
  unit: TaskBudgetUnit
  customUnit: string | null
} {
  const words = normalizeUnitText(text)
  if (!words) return { unit: TaskBudgetUnit.Total, customUnit: null }
  const known = UNIT_BY_TEXT.get(unitKey(words))
  if (known) return { unit: known, customUnit: null }
  return { unit: TaskBudgetUnit.Custom, customUnit: words }
}

/** The suggestion the field's text is, so its chip shows as chosen. */
export function chosenUnitSuggestion(
  text: string,
): BudgetUnitSuggestion | null {
  const { unit } = budgetUnitFromText(text)
  return (BUDGET_UNIT_SUGGESTIONS as readonly TaskBudgetUnit[]).includes(unit)
    ? (unit as BudgetUnitSuggestion)
    : null
}

/** The unit field's text for a saved budget (Edit task, Post again). */
export function budgetUnitText(
  budget: TaskBudgetLike,
  copy: TaskBudgetCopy,
): string {
  if (!hasTaskBudget(budget)) return ''
  const unit = taskBudgetUnit(budget)
  if (unit === TaskBudgetUnit.Total) return ''
  if (unit === TaskBudgetUnit.Custom) return taskBudgetCustomUnit(budget) ?? ''
  return copy.suggestion[unit]
}

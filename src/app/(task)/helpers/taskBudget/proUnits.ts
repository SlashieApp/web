import { normalizeUnitText } from './taskBudget'

/**
 * Budget units are a Slashie Pro feature (Ryan 22 Nov, BE-149): with Pro the
 * poster picks or types what the amount is for; without it every budget is
 * one-off (a price for the whole job), with no unit choice.
 *
 * A task that already has a unit keeps it: on Edit task its owner without Pro
 * is offered only "Whole job" and that unit, so they can keep it or drop it.
 * The API holds the same line (`PRO_REQUIRED` for a new unit without Pro).
 */
export type BudgetUnitChoice =
  /** Every unit, and the poster's own words. */
  | 'all'
  /** Whole job, or the unit the task already has (Edit task, no Pro). */
  | 'keep'
  /** No unit question: the budget is for the whole job. */
  | 'none'

/** `keptUnit`: the unit text the task was saved with (Edit task); blank on a new task. */
export function budgetUnitChoice(
  hasPro: boolean,
  keptUnit?: string | null,
): BudgetUnitChoice {
  if (hasPro) return 'all'
  return normalizeUnitText(keptUnit ?? '') ? 'keep' : 'none'
}

/**
 * The unit text the form may hold and send: what was typed with Pro; without
 * it the task's own unit when it is still the one chosen, else blank (the
 * whole job). So a draft or a copied task never carries a unit past the gate.
 */
export function allowedBudgetUnit(
  unit: string,
  hasPro: boolean,
  keptUnit?: string | null,
): string {
  if (hasPro) return unit
  const kept = normalizeUnitText(keptUnit ?? '')
  return kept && normalizeUnitText(unit) === kept ? unit : ''
}

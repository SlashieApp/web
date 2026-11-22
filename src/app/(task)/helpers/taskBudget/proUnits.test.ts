import { describe, expect, it } from 'vitest'

import { allowedBudgetUnit, budgetUnitChoice } from './proUnits'

describe('budget units are Slashie Pro only (FE-603, BE-149)', () => {
  it('with Pro every unit is offered', () => {
    expect(budgetUnitChoice(true)).toBe('all')
    expect(budgetUnitChoice(true, 'per hour')).toBe('all')
  })

  it('without Pro a new task has no unit question: every budget is one-off', () => {
    expect(budgetUnitChoice(false)).toBe('none')
    expect(budgetUnitChoice(false, '')).toBe('none')
    expect(budgetUnitChoice(false, '   ')).toBe('none')
    expect(budgetUnitChoice(false, null)).toBe('none')
  })

  it('without Pro a task that already has a unit can keep it or drop it', () => {
    expect(budgetUnitChoice(false, 'per hour')).toBe('keep')
    expect(budgetUnitChoice(false, 'per room')).toBe('keep')
  })

  it('with Pro the unit is sent as typed', () => {
    expect(allowedBudgetUnit('per room', true)).toBe('per room')
    expect(allowedBudgetUnit('', true)).toBe('')
  })

  it('without Pro a unit never leaves the form on a new task (a draft, a copied task)', () => {
    expect(allowedBudgetUnit('per hour', false)).toBe('')
    expect(allowedBudgetUnit('per room', false, '')).toBe('')
    expect(allowedBudgetUnit('', false)).toBe('')
  })

  it("without Pro the task's own unit may stay, and nothing else", () => {
    expect(allowedBudgetUnit('per hour', false, 'per hour')).toBe('per hour')
    // Spaces are tidied the way the API tidies them.
    expect(allowedBudgetUnit(' per  hour ', false, 'per hour')).toBe(
      ' per  hour ',
    )
    expect(allowedBudgetUnit('per day', false, 'per hour')).toBe('')
    expect(allowedBudgetUnit('', false, 'per hour')).toBe('')
  })
})

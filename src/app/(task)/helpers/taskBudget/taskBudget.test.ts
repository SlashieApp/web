import { TaskBudgetUnit } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import bag from './i11n.json'
import {
  BUDGET_UNIT_SUGGESTIONS,
  budgetUnitFromText,
  budgetUnitText,
  chosenUnitSuggestion,
  hasTaskBudget,
  taskBudgetPhrase,
  taskBudgetPinLabel,
  taskBudgetPrice,
  taskBudgetUnit,
  taskBudgetUnitLabel,
} from './taskBudget'

/** FE-584 (BE-139; Ryan 21 Nov): open budget and the poster's own unit. */
const en = bag.en
const zh = bag.zh_hk
const priced = (unit: TaskBudgetUnit, customUnit: string | null = null) => ({
  amount: 60,
  currency: 'GBP',
  unit,
  customUnit,
})

describe('reading a budget', () => {
  it('no budget is an open budget: "Open budget", "Open" on the pin', () => {
    for (const none of [null, undefined, { amount: 0, currency: 'GBP' }]) {
      expect(hasTaskBudget(none)).toBe(false)
      expect(taskBudgetPrice(none, en)).toEqual({
        open: true,
        amount: 'Open budget',
        unitLabel: null,
      })
      expect(taskBudgetPinLabel(none, en)).toBe('Open')
      expect(taskBudgetPhrase(none, en)).toBe('Open budget')
    }
    expect(taskBudgetPrice(null, zh).amount).toBe('開放預算')
    expect(taskBudgetPinLabel(null, zh)).toBe('開放')
  })

  it('a known unit reads in the reader’s language; a blank one is "Fixed price"', () => {
    expect(taskBudgetPrice(priced(TaskBudgetUnit.PerDay), en)).toEqual({
      open: false,
      amount: '£60',
      unitLabel: 'Per day',
    })
    expect(taskBudgetUnitLabel(priced(TaskBudgetUnit.PerDay), zh)).toBe('按日')
    expect(taskBudgetUnitLabel(priced(TaskBudgetUnit.Total), en)).toBe(
      'Fixed price',
    )
    expect(taskBudgetUnitLabel(priced(TaskBudgetUnit.Total), zh)).toBe('固定價')
    for (const unit of BUDGET_UNIT_SUGGESTIONS) {
      expect(taskBudgetUnitLabel(priced(unit), en)).toBe(en.unit[unit])
      expect(taskBudgetUnitLabel(priced(unit), zh)).toBe(zh.unit[unit])
    }
  })

  it('the poster’s own words show as typed, in every language', () => {
    const room = priced(TaskBudgetUnit.Custom, 'per room')
    expect(taskBudgetUnitLabel(room, en)).toBe('per room')
    expect(taskBudgetUnitLabel(room, zh)).toBe('per room')
    expect(taskBudgetPhrase(room, en)).toBe('£60 per room')
    expect(taskBudgetPhrase(room, zh)).toBe('£60（per room）')
    // A custom unit with no words left reads as the whole job.
    expect(taskBudgetUnitLabel(priced(TaskBudgetUnit.Custom, '  '), en)).toBe(
      'Fixed price',
    )
  })

  it('an older budget with only a type reads as its unit', () => {
    expect(taskBudgetUnit({ amount: 20, type: 'PER_HOUR' })).toBe(
      TaskBudgetUnit.PerHour,
    )
    expect(taskBudgetUnit({ amount: 20, type: 'PER_DAY' })).toBe(
      TaskBudgetUnit.PerDay,
    )
    expect(taskBudgetUnit({ amount: 20, type: 'ONE_OFF' })).toBe(
      TaskBudgetUnit.Total,
    )
    expect(taskBudgetUnit({ amount: 20 })).toBe(TaskBudgetUnit.Total)
  })

  it('in a sentence: "£20 an hour", "每小時 £20", "£120"', () => {
    expect(
      taskBudgetPhrase({ ...priced(TaskBudgetUnit.PerHour), amount: 20 }, en),
    ).toBe('£20 an hour')
    expect(
      taskBudgetPhrase({ ...priced(TaskBudgetUnit.PerHour), amount: 20 }, zh),
    ).toBe('每小時 £20')
    expect(
      taskBudgetPhrase({ ...priced(TaskBudgetUnit.Total), amount: 120 }, en),
    ).toBe('£120')
    expect(taskBudgetPhrase(priced(TaskBudgetUnit.PerItem), en)).toBe(
      '£60 an item',
    )
  })
})

describe('the unit field', () => {
  it('empty is the whole job; a suggestion in either language is that unit', () => {
    expect(budgetUnitFromText('')).toEqual({
      unit: TaskBudgetUnit.Total,
      customUnit: null,
    })
    expect(budgetUnitFromText('  Per   Day ')).toEqual({
      unit: TaskBudgetUnit.PerDay,
      customUnit: null,
    })
    expect(budgetUnitFromText('按小時').unit).toBe(TaskBudgetUnit.PerHour)
    expect(budgetUnitFromText('Fixed price').unit).toBe(TaskBudgetUnit.Total)
    for (const unit of BUDGET_UNIT_SUGGESTIONS) {
      expect(budgetUnitFromText(en.suggestion[unit]).unit).toBe(unit)
      expect(budgetUnitFromText(zh.suggestion[unit]).unit).toBe(unit)
    }
  })

  it('anything else is the poster’s own words, tidied', () => {
    expect(budgetUnitFromText('  per   room ')).toEqual({
      unit: TaskBudgetUnit.Custom,
      customUnit: 'per room',
    })
  })

  it('a chip shows as chosen while the text is its suggestion', () => {
    expect(chosenUnitSuggestion('per week')).toBe(TaskBudgetUnit.PerWeek)
    expect(chosenUnitSuggestion('per room')).toBeNull()
    expect(chosenUnitSuggestion('')).toBeNull()
  })

  it('a saved budget fills the field back: blank, the suggestion, or the words', () => {
    expect(budgetUnitText(priced(TaskBudgetUnit.Total), en)).toBe('')
    expect(budgetUnitText(priced(TaskBudgetUnit.PerDay), en)).toBe('per day')
    expect(budgetUnitText(priced(TaskBudgetUnit.PerDay), zh)).toBe('按日')
    expect(budgetUnitText(priced(TaskBudgetUnit.Custom, 'per room'), zh)).toBe(
      'per room',
    )
    expect(budgetUnitText(null, en)).toBe('')
  })
})

describe('the copy', () => {
  it('both languages have every key, and no long dashes', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === 'object' ? keys(v).map((s) => `${k}.${s}`) : [k],
      )
    expect(keys(zh).sort()).toEqual(keys(en).sort())
    expect(JSON.stringify(bag)).not.toMatch(/—/)
  })
})

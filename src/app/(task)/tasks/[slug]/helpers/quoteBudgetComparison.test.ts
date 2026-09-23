import { describe, expect, it } from 'vitest'

import { quoteBudgetComparison } from './quoteBudgetComparison'

describe('quoteBudgetComparison', () => {
  it('reports how far a quote is under the budget', () => {
    expect(quoteBudgetComparison(120, 85)).toEqual({
      kind: 'under',
      difference: 35,
    })
  })

  it('reports how far a quote is over the budget', () => {
    expect(quoteBudgetComparison(120, 130.5)).toEqual({
      kind: 'over',
      difference: 10.5,
    })
  })

  it('matches when the quote equals the budget', () => {
    expect(quoteBudgetComparison(120, 120)).toEqual({ kind: 'match' })
  })
})

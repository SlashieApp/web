import { describe, expect, it } from 'vitest'

import { taskCategoriesSummary, taskCategoryLabels } from './taskCategories'

describe('task categories (BE-79)', () => {
  it('labels open strings and legacy codes', () => {
    expect(taskCategoryLabels(['TECH_SETUP', 'Dog walking', ' '])).toEqual([
      'Tech setup',
      'Dog walking',
    ])
    expect(taskCategoryLabels(null)).toEqual([])
  })

  it('summarises with a +N overflow', () => {
    expect(taskCategoriesSummary(['Cleaning'])).toBe('Cleaning')
    expect(taskCategoriesSummary(['Cleaning', 'Moving', 'Painting'])).toBe(
      'Cleaning +2',
    )
    expect(taskCategoriesSummary(['Cleaning', 'Moving', 'Painting'], 2)).toBe(
      'Cleaning, Moving +1',
    )
    expect(taskCategoriesSummary([])).toBeNull()
  })
})

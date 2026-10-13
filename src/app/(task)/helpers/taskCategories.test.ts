import { describe, expect, it } from 'vitest'

import {
  TASK_CATEGORIES_MAX,
  addTaskCategories,
  suggestedTaskCategories,
  taskCategoriesSchema,
  taskCategoriesSummary,
  taskCategoryLabels,
} from './taskCategories'

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

describe('addTaskCategories', () => {
  it('normalises, splits on commas and skips duplicates ignoring case', () => {
    expect(
      addTaskCategories(['Cleaning'], '  dog   walking , cleaning,'),
    ).toEqual({ categories: ['Cleaning', 'dog walking'] })
  })

  it('stops at the API limits', () => {
    const full = Array.from({ length: TASK_CATEGORIES_MAX }, (_, i) => `C${i}`)
    expect(addTaskCategories(full, 'One more').error).toBe('tooMany')
    expect(addTaskCategories([], 'x'.repeat(65)).error).toBe('tooLong')
  })
})

describe('suggestedTaskCategories', () => {
  it('puts popular first, adds starters, hides added, dedupes', () => {
    const out = suggestedTaskCategories(['Dog walking', 'cleaning'], ['Moving'])
    expect(out.slice(0, 2)).toEqual(['Dog walking', 'cleaning'])
    expect(out).not.toContain('Cleaning')
    expect(out).not.toContain('Moving')
    expect(out).toContain('Plumbing')
  })
})

describe('taskCategoriesSchema', () => {
  it('needs 1 to 10 categories', () => {
    expect(taskCategoriesSchema.safeParse([]).success).toBe(false)
    expect(taskCategoriesSchema.safeParse(['Cleaning']).success).toBe(true)
  })
})

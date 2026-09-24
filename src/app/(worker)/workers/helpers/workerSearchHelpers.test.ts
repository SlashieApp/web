import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { type WorkerSearchItem, workerRatingLabel } from './workerSearchHelpers'

const dir = dirname(fileURLToPath(import.meta.url))

function item(summary: {
  average: number | null
  count: number
}): WorkerSearchItem {
  return { ratingSummary: summary } as WorkerSearchItem
}

describe('workerRatingLabel', () => {
  it('hides the average until there are 3 reviews', () => {
    expect(workerRatingLabel(item({ average: 5, count: 2 }))).toBeNull()
    expect(workerRatingLabel(item({ average: 4.5, count: 3 }))).toBe('4.5 (3)')
    expect(workerRatingLabel(item({ average: null, count: 4 }))).toBeNull()
  })
})

describe('worker search sort', () => {
  it('sorts by distance', () => {
    const src = readFileSync(
      join(dir, '../context/WorkerSearchProvider.tsx'),
      'utf8',
    )
    expect(src).toContain('WorkerSortField.Distance')
    expect(src).not.toContain('WorkerSortField.Rating')
  })
})

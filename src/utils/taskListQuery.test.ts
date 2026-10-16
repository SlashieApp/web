import { describe, expect, it } from 'vitest'

import { buildTaskFilter } from './taskListQuery'

describe('buildTaskFilter', () => {
  it('trims the search and keeps the category (My Tasks hub lists)', () => {
    expect(
      buildTaskFilter({ search: ' cabinet ', category: 'CLEANING' }),
    ).toEqual({ search: 'cabinet', category: 'CLEANING' })
  })

  it('sends nothing when every field is blank', () => {
    expect(buildTaskFilter({ search: '  ', category: '' })).toBeUndefined()
  })
})

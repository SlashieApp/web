import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import { taskFieldError } from './taskFieldError'

describe('taskFieldError', () => {
  it('shows a copy key in the reader’s language', () => {
    expect(taskFieldError(bag.en.errors, 'titleRequired')).toBe('Add a title.')
    expect(taskFieldError(bag.zh_hk.errors, 'titleRequired')).toBe(
      '請加入標題。',
    )
  })

  it('passes anything else through', () => {
    expect(taskFieldError(bag.en.errors, 'Server said no')).toBe(
      'Server said no',
    )
    expect(taskFieldError(bag.en.errors, undefined)).toBeUndefined()
  })

  it('has copy for every key the schema and the map can raise', () => {
    for (const key of [
      'titleRequired',
      'descriptionRequired',
      'addressRequired',
      'areaRequired',
      'mapUnreadable',
      'budgetRequired',
      'dateRequired',
      'dateInPast',
      'timeRequired',
      'timeInvalid',
      'consentRequired',
      'categoryRequired',
      'tooManyCategories',
      'categoryTooLong',
      'placeNotFound',
      'locationMissing',
    ]) {
      expect(bag.en.errors, key).toHaveProperty(key)
      expect(bag.zh_hk.errors, key).toHaveProperty(key)
    }
  })
})

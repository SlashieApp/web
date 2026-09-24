import { describe, expect, it } from 'vitest'

import { isMapHomePath } from './landPopup'

describe('isMapHomePath', () => {
  it('treats search and the signed-in root as the map home', () => {
    expect(isMapHomePath('/search')).toBe(true)
    expect(isMapHomePath('/zh-hk/search')).toBe(true)
    expect(isMapHomePath('/search?mode=tasks')).toBe(true)
    expect(isMapHomePath('/')).toBe(true)
    expect(isMapHomePath('/zh-hk')).toBe(true)
    expect(isMapHomePath('/tasks')).toBe(false)
    expect(isMapHomePath('/tasks/abc')).toBe(false)
    expect(isMapHomePath('/home')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'

import { TOUCH_SCREEN_QUERY, offersCamera } from './photoSource'

/** A screen that matches only the media queries in `matching`. */
const screen = (...matching: string[]) => ({
  matchMedia: (query: string) => ({ matches: matching.includes(query) }),
})

describe('offersCamera', () => {
  it('offers the camera on a touch screen (phones and tablets)', () => {
    expect(offersCamera(screen(TOUCH_SCREEN_QUERY))).toBe(true)
  })

  it('goes straight to the file picker with a mouse or trackpad', () => {
    expect(offersCamera(screen())).toBe(false)
    expect(offersCamera(screen('(pointer: coarse)'))).toBe(false)
  })

  it('goes straight to the file picker where media queries are missing', () => {
    expect(offersCamera({})).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'

import { PIN_MAPBOX_ANCHOR, PIN_MAPBOX_OFFSET, pinVisualState } from './marker'

describe('pinVisualState', () => {
  it('expands the selected pin label and keeps the compact pill hidden', () => {
    expect(pinVisualState(true, false)).toEqual({
      selected: true,
      expanded: true,
      showPill: false,
    })
  })

  it('stays compact when idle and expands on hover only', () => {
    expect(pinVisualState(false, false)).toEqual({
      selected: false,
      expanded: false,
      showPill: true,
    })
    expect(pinVisualState(false, true)).toEqual({
      selected: false,
      expanded: true,
      showPill: false,
    })
  })
})

describe('pin Mapbox placement', () => {
  it('anchors the tip on lat/lng with no pixel lift', () => {
    expect(PIN_MAPBOX_ANCHOR).toBe('bottom')
    expect(PIN_MAPBOX_OFFSET).toEqual([0, 0])
  })
})

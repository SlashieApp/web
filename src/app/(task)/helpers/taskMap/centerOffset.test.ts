import { describe, expect, it } from 'vitest'

import {
  DESKTOP_MAP_CENTER_LEFT_INSET_PX,
  mapCenterOffsetPx,
  paddingForMapCenterOffset,
} from './centerOffset'

describe('map centre offset', () => {
  it('shifts the desktop centre into the open map, and leaves phones centred', () => {
    expect(mapCenterOffsetPx(DESKTOP_MAP_CENTER_LEFT_INSET_PX)).toEqual([
      150, 0,
    ])
    expect(mapCenterOffsetPx(0)).toEqual([0, 0])
    expect(paddingForMapCenterOffset([150, 0])).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 300,
    })
    expect(paddingForMapCenterOffset([0, 0])).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })
})

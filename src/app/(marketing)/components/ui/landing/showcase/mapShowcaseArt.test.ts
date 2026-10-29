import { describe, expect, it } from 'vitest'

import {
  MAP_MAJOR_ROADS,
  MAP_MINOR_STREETS,
  MAP_PARKS,
  MAP_STREET_SPACING,
  MAP_VIEWBOX,
  streetPositions,
  streetSpacing,
} from './mapShowcaseArt'

describe('streetSpacing', () => {
  it('stays between the minimum and maximum gap', () => {
    for (let index = 0; index < 200; index += 1) {
      const gap = streetSpacing(index)
      expect(gap).toBeGreaterThanOrEqual(MAP_STREET_SPACING.min)
      expect(gap).toBeLessThanOrEqual(MAP_STREET_SPACING.max)
    }
  })

  it('varies, so the blocks are not all one size', () => {
    const gaps = new Set(
      Array.from({ length: 20 }, (_, index) => streetSpacing(index)),
    )
    expect(gaps.size).toBeGreaterThan(2)
  })

  it('is the same every time (server and client draw the same map)', () => {
    expect(streetSpacing(3)).toBe(streetSpacing(3))
    expect(streetPositions(-120, 1320)).toEqual(streetPositions(-120, 1320))
  })
})

describe('streetPositions', () => {
  it('runs from the start to past the end, in increasing order', () => {
    const positions = streetPositions(-60, 660, 7)
    expect(positions[0]).toBe(-60)
    expect(positions[positions.length - 1]).toBeLessThanOrEqual(660)
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1])
    }
  })

  it('leaves no gap wider than the maximum spacing (plus rounding)', () => {
    const positions = streetPositions(0, 1200)
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index] - positions[index - 1]).toBeLessThanOrEqual(
        MAP_STREET_SPACING.max + 1,
      )
    }
  })
})

describe('the drawn map', () => {
  it('has streets in both directions and wide roads', () => {
    expect(MAP_MINOR_STREETS.length).toBeGreaterThan(10)
    expect(MAP_MAJOR_ROADS.length).toBeGreaterThan(3)
  })

  it('is made of well-formed paths (no NaN from the street maths)', () => {
    for (const d of [...MAP_MINOR_STREETS, ...MAP_MAJOR_ROADS]) {
      expect(d.startsWith('M ')).toBe(true)
      expect(d).not.toMatch(/NaN|undefined|Infinity/)
    }
  })

  it('keeps every park on the canvas', () => {
    for (const park of MAP_PARKS) {
      expect(park.x).toBeGreaterThanOrEqual(0)
      expect(park.y).toBeGreaterThanOrEqual(0)
      expect(park.x + park.width).toBeLessThanOrEqual(MAP_VIEWBOX.width)
      expect(park.y + park.height).toBeLessThanOrEqual(MAP_VIEWBOX.height)
    }
  })
})

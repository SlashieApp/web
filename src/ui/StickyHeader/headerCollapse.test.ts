import { describe, expect, it } from 'vitest'

import {
  BAR_H,
  BAR_TITLE_INSET,
  BAR_TITLE_PX,
  BAR_TITLE_TOP,
  BUTTON_OVERHANG,
  COLLAPSE_DISTANCE,
  TITLE_GAP,
  TITLE_PX,
  clamp01,
  collapseFrame,
  collapseProgress,
  collapseStart,
  crossfade,
  titlePosition,
  titleScale,
} from './headerCollapse'

describe('header numbers', () => {
  it('match the spec: a 56px bar, 48px of travel, buttons 10px off the edge', () => {
    expect(BAR_H).toBe(56)
    expect(TITLE_GAP).toBe(8)
    expect(BAR_TITLE_TOP).toBe(16)
    expect(COLLAPSE_DISTANCE).toBe(48)
    expect(BAR_TITLE_INSET).toBe(40)
    expect(TITLE_PX).toBe(34)
    expect(BAR_TITLE_PX).toBe(18)
    expect(BUTTON_OVERHANG).toBe(10)
  })
})

describe('clamp01', () => {
  it('keeps a value in 0 to 1', () => {
    expect(clamp01(-3)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(7)).toBe(1)
  })
})

describe('collapseStart', () => {
  it('is 0 on an ordinary page, where the title rests 8px under the bar', () => {
    expect(collapseStart({ scrollY: 0, titleTop: 64, barBottom: 56 })).toBe(0)
  })

  it('is the title top minus its resting top where the title rests lower', () => {
    expect(collapseStart({ scrollY: 0, titleTop: 300, barBottom: 56 })).toBe(
      236,
    )
  })

  it('does not move while the page scrolls', () => {
    const at = (scrollY: number) =>
      collapseStart({ scrollY, titleTop: 300 - scrollY, barBottom: 56 })
    expect(at(0)).toBe(236)
    expect(at(100)).toBe(236)
    expect(at(236)).toBe(236)
  })

  it('counts from the stuck bar, so a bar under a sticky header needs no offset', () => {
    // A 58px site header, then the bar: it ends at 114, the title rests at 122.
    expect(collapseStart({ scrollY: 0, titleTop: 122, barBottom: 114 })).toBe(0)
  })

  it('never goes below 0', () => {
    expect(collapseStart({ scrollY: 0, titleTop: 50, barBottom: 56 })).toBe(0)
  })
})

describe('collapseProgress', () => {
  it('is 0 up to the start, then 1px of scroll per 1/48', () => {
    expect(collapseProgress(0, 0)).toBe(0)
    expect(collapseProgress(100, 236)).toBe(0)
    expect(collapseProgress(236, 236)).toBe(0)
    expect(collapseProgress(260, 236)).toBe(0.5)
    expect(collapseProgress(24, 0)).toBe(0.5)
  })

  it('is 1 once the title has travelled 48px, and stays 1', () => {
    expect(collapseProgress(48, 0)).toBe(1)
    expect(collapseProgress(284, 236)).toBe(1)
    expect(collapseProgress(900, 236)).toBe(1)
  })

  it('ignores an overscroll above the top', () => {
    expect(collapseProgress(-20, 0)).toBe(0)
  })
})

describe('titleScale', () => {
  it('goes from 34px to 18px, linear in p', () => {
    expect(titleScale(0)).toBe(1)
    expect(titleScale(1)).toBeCloseTo(18 / 34, 10)
    expect(titleScale(0.5)).toBeCloseTo((1 + 18 / 34) / 2, 10)
    expect(34 * titleScale(1)).toBeCloseTo(18, 10)
  })

  it('holds at the ends outside 0 to 1', () => {
    expect(titleScale(-1)).toBe(1)
    expect(titleScale(2)).toBeCloseTo(18 / 34, 10)
  })
})

describe('titlePosition', () => {
  // Phone, ordinary page: a 56px bar at the top, content left at 16.
  const bar = { contentLeft: 16, rowTop: 0 }
  const rest = { x: 16, y: BAR_H + TITLE_GAP }

  it('starts under the bar at the content edge', () => {
    expect(titlePosition(0, rest, bar)).toEqual({ x: 16, y: 64 })
  })

  it('ends 40px in and 16px into the row', () => {
    expect(titlePosition(1, rest, bar)).toEqual({ x: 56, y: 16 })
  })

  it('moves 1px up per px of scroll, so the page scroll carries it', () => {
    for (const scrolled of [0, 12, 24, 36, 48]) {
      const p = collapseProgress(scrolled, 0)
      expect(titlePosition(p, rest, bar).y).toBe(64 - scrolled)
    }
  })

  it('is halfway at p 0.5', () => {
    expect(titlePosition(0.5, rest, bar)).toEqual({ x: 36, y: 40 })
  })

  it('stays within the ends', () => {
    expect(titlePosition(-1, rest, bar)).toEqual({ x: 16, y: 64 })
    expect(titlePosition(3, rest, bar)).toEqual({ x: 56, y: 16 })
  })

  it('goes to the same place from a title that rests inset (a cover card)', () => {
    const inset = { x: 32, y: 64 }
    expect(titlePosition(0, inset, bar)).toEqual({ x: 32, y: 64 })
    expect(titlePosition(1, inset, bar)).toEqual({ x: 56, y: 16 })
  })

  it('counts the row top, so a bar under a sticky header lines up', () => {
    const lower = { contentLeft: 24, rowTop: 58 }
    expect(titlePosition(1, { x: 24, y: 122 }, lower)).toEqual({ x: 64, y: 74 })
  })
})

describe('crossfade', () => {
  it('keeps the moving title until p 0.75', () => {
    expect(crossfade(0)).toEqual({ title: 1, bar: 0 })
    expect(crossfade(0.5)).toEqual({ title: 1, bar: 0 })
    expect(crossfade(0.75)).toEqual({ title: 1, bar: 0 })
  })

  it('hands over to the bar copy by p 1', () => {
    expect(crossfade(1)).toEqual({ title: 0, bar: 1 })
  })

  it('is half and half in between', () => {
    const mid = crossfade(0.875)
    expect(mid.title).toBeCloseTo(0.5, 10)
    expect(mid.bar).toBeCloseTo(0.5, 10)
  })

  it('always sums to one', () => {
    for (const p of [0, 0.3, 0.76, 0.8, 0.9, 0.99, 1]) {
      const fade = crossfade(p)
      expect(fade.title + fade.bar).toBeCloseTo(1, 10)
    }
  })
})

describe('collapseFrame', () => {
  it('is at rest at the top of an ordinary page', () => {
    expect(collapseFrame(0, 0, false)).toEqual({
      p: 0,
      moving: false,
      scale: 1,
      movingOpacity: 1,
      barTitleOpacity: 0,
      barBgOpacity: 0,
    })
  })

  it('moves the title as soon as the page scrolls', () => {
    const frame = collapseFrame(1, 0, false)
    expect(frame.moving).toBe(true)
    expect(frame.p).toBeCloseTo(1 / 48, 10)
  })

  it('is part-way at 24px', () => {
    const frame = collapseFrame(24, 0, false)
    expect(frame.p).toBe(0.5)
    expect(frame.scale).toBeCloseTo((1 + 18 / 34) / 2, 10)
    expect(frame.movingOpacity).toBe(1)
    expect(frame.barTitleOpacity).toBe(0)
    expect(frame.barBgOpacity).toBe(0.5)
  })

  it('has collapsed into the bar at 48px', () => {
    const frame = collapseFrame(48, 0, false)
    expect(frame.p).toBe(1)
    expect(frame.movingOpacity).toBe(0)
    expect(frame.barTitleOpacity).toBe(1)
    expect(frame.barBgOpacity).toBe(1)
  })

  it('waits for a title that rests lower', () => {
    expect(collapseFrame(200, 236, false).moving).toBe(false)
    expect(collapseFrame(236, 236, false).moving).toBe(false)
    expect(collapseFrame(250, 236, false).moving).toBe(true)
  })

  it('does not interpolate with reduced motion: hidden, then shown at once', () => {
    for (const scrollY of [0, 24, 47]) {
      expect(collapseFrame(scrollY, 0, true)).toEqual({
        p: 0,
        moving: false,
        scale: 1,
        movingOpacity: 0,
        barTitleOpacity: 0,
        barBgOpacity: 0,
      })
    }
    const done = collapseFrame(48, 0, true)
    expect(done.barTitleOpacity).toBe(1)
    expect(done.barBgOpacity).toBe(1)
    expect(done.moving).toBe(false)
    expect(done.scale).toBe(1)
  })

  it('counts the 48px from the start with reduced motion too', () => {
    expect(collapseFrame(283, 236, true).barTitleOpacity).toBe(0)
    expect(collapseFrame(284, 236, true).barTitleOpacity).toBe(1)
  })
})

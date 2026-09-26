import { describe, expect, it } from 'vitest'

import {
  SHEET_DISMISS_RATIO,
  SHEET_FLICK_VELOCITY,
  clientDeltaToOffset,
  offscreenTransform,
  offsetToTranslate,
  resolveSheetSettle,
  rubberBandOffset,
  scrimOpacity,
  scrollCanAbsorb,
  sheetAxis,
  sheetTransition,
  velocityFromSamples,
} from './sheetMotion'

describe('sheetAxis', () => {
  it('dismisses bottom sheets downward and top sheets upward', () => {
    expect(sheetAxis('bottom', 'ltr')).toEqual({ axis: 'y', sign: 1 })
    expect(sheetAxis('top', 'ltr')).toEqual({ axis: 'y', sign: -1 })
  })

  it('mirrors start and end in RTL', () => {
    expect(sheetAxis('end', 'ltr')).toEqual({ axis: 'x', sign: 1 })
    expect(sheetAxis('end', 'rtl')).toEqual({ axis: 'x', sign: -1 })
    expect(sheetAxis('start', 'ltr')).toEqual({ axis: 'x', sign: -1 })
    expect(sheetAxis('start', 'rtl')).toEqual({ axis: 'x', sign: 1 })
  })
})

describe('offsetToTranslate', () => {
  it('moves along the dismiss direction', () => {
    expect(offsetToTranslate(40, sheetAxis('bottom', 'ltr'))).toEqual({
      x: 0,
      y: 40,
    })
    expect(offsetToTranslate(40, sheetAxis('top', 'ltr'))).toEqual({
      x: 0,
      y: -40,
    })
    expect(offsetToTranslate(40, sheetAxis('start', 'ltr'))).toEqual({
      x: -40,
      y: 0,
    })
    expect(offsetToTranslate(40, sheetAxis('end', 'rtl'))).toEqual({
      x: -40,
      y: 0,
    })
  })
})

describe('offscreenTransform', () => {
  it('parks the sheet fully off its own edge', () => {
    expect(offscreenTransform('bottom', 'ltr')).toBe('translate3d(0, 100%, 0)')
    expect(offscreenTransform('top', 'ltr')).toBe('translate3d(0, -100%, 0)')
    expect(offscreenTransform('end', 'ltr')).toBe('translate3d(100%, 0, 0)')
    expect(offscreenTransform('start', 'rtl')).toBe('translate3d(100%, 0, 0)')
  })
})

describe('clientDeltaToOffset', () => {
  it('treats downward movement on a bottom sheet as dismiss', () => {
    expect(clientDeltaToOffset(0, 24, sheetAxis('bottom', 'ltr'))).toBe(24)
    expect(clientDeltaToOffset(-24, 0, sheetAxis('start', 'ltr'))).toBe(24)
  })
})

describe('rubberBandOffset', () => {
  it('tracks 1:1 inside the travel range', () => {
    expect(rubberBandOffset(40, 200)).toBe(40)
  })

  it('resists pulls past the open and closed edges', () => {
    const pulledOpen = rubberBandOffset(-80, 200)
    expect(pulledOpen).toBeLessThan(0)
    expect(pulledOpen).toBeGreaterThan(-80)

    const pulledClosed = rubberBandOffset(280, 200)
    expect(pulledClosed).toBeGreaterThan(200)
    expect(pulledClosed).toBeLessThan(280)
  })
})

describe('resolveSheetSettle', () => {
  const travel = 1000

  it('settles open on a gentle release below the threshold', () => {
    expect(resolveSheetSettle({ offset: 200, travel, velocity: 0 })).toEqual({
      target: 'open',
      flick: false,
    })
  })

  it('dismisses on a gentle release past the threshold without a flick', () => {
    const past = travel * SHEET_DISMISS_RATIO + 20
    expect(resolveSheetSettle({ offset: past, travel, velocity: 40 })).toEqual({
      target: 'closed',
      flick: false,
    })
  })

  it('projects a sub-flick velocity across the threshold', () => {
    const velocity = SHEET_FLICK_VELOCITY - 120
    const offset = 250
    expect(resolveSheetSettle({ offset, travel, velocity })).toEqual({
      target: 'closed',
      flick: false,
    })
  })

  it('dismisses a flick even when the finger is still near open', () => {
    expect(
      resolveSheetSettle({
        offset: 16,
        travel,
        velocity: SHEET_FLICK_VELOCITY + 50,
      }),
    ).toEqual({ target: 'closed', flick: true })
  })

  it('reverses a flick toward open even past the midpoint', () => {
    expect(
      resolveSheetSettle({
        offset: travel * 0.7,
        travel,
        velocity: -(SHEET_FLICK_VELOCITY + 50),
      }),
    ).toEqual({ target: 'open', flick: true })
  })
})

describe('sheetTransition', () => {
  it('uses a critically damped spring for gentle settles', () => {
    expect(sheetTransition(false, false)).toEqual({
      type: 'spring',
      bounce: 0,
      duration: 0.45,
    })
  })

  it('uses a slight bounce only for flicks', () => {
    const flick = sheetTransition(true, false)
    expect(flick.type).toBe('spring')
    if (flick.type !== 'spring') return
    expect(flick.bounce).toBeGreaterThan(0)
    expect(flick.bounce).toBeLessThan(0.3)
  })

  it('snaps when reduced motion is requested', () => {
    expect(sheetTransition(false, true)).toEqual({ type: 'snap' })
    expect(sheetTransition(true, true)).toEqual({ type: 'snap' })
  })
})

describe('velocityFromSamples', () => {
  it('returns px/s from recent samples', () => {
    expect(
      velocityFromSamples([
        { t: 0, offset: 0 },
        { t: 50, offset: 40 },
        { t: 100, offset: 80 },
      ]),
    ).toBeCloseTo(800)
  })

  it('returns 0 for a single sample', () => {
    expect(velocityFromSamples([{ t: 0, offset: 10 }])).toBe(0)
  })
})

describe('scrollCanAbsorb', () => {
  it('lets content consume the gesture until the dismiss edge', () => {
    expect(
      scrollCanAbsorb(
        { scrollTop: 24, scrollHeight: 400, clientHeight: 200 },
        8,
      ),
    ).toBe(true)
    expect(
      scrollCanAbsorb(
        { scrollTop: 0, scrollHeight: 400, clientHeight: 200 },
        8,
      ),
    ).toBe(false)
  })

  it('lets content scroll onward until the far edge', () => {
    expect(
      scrollCanAbsorb(
        { scrollTop: 40, scrollHeight: 400, clientHeight: 200 },
        -8,
      ),
    ).toBe(true)
    expect(
      scrollCanAbsorb(
        { scrollTop: 200, scrollHeight: 400, clientHeight: 200 },
        -8,
      ),
    ).toBe(false)
  })
})

describe('scrimOpacity', () => {
  it('fades with dismiss progress and stays solid while rubber-banding open', () => {
    expect(scrimOpacity(0, 200)).toBe(1)
    expect(scrimOpacity(100, 200)).toBe(0.5)
    expect(scrimOpacity(200, 200)).toBe(0)
    expect(scrimOpacity(-20, 200)).toBe(1)
  })
})

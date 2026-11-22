import { describe, expect, it } from 'vitest'

import { sdlMotion } from '@/theme/styles'

import {
  STEP_IN_FADE_MS,
  STEP_IN_MS,
  STEP_IN_OFFSET_PX,
  stepDirectionBetween,
  stepInKeyframes,
} from './stepIn'

/** Steps arrive from the side you are heading to (Ryan 22 Nov). */
describe('a step sliding in', () => {
  it('later in the flow is forward, earlier is back', () => {
    expect(stepDirectionBetween(0, 1)).toBe('forward')
    expect(stepDirectionBetween(3, 1)).toBe('back')
  })

  it('nothing moves on arrival, staying put, or in a one-screen flow', () => {
    expect(stepDirectionBetween(undefined, 0)).toBeNull()
    expect(stepDirectionBetween(2, 2)).toBeNull()
    expect(stepDirectionBetween(1, undefined)).toBeNull()
    expect(stepDirectionBetween(undefined, undefined)).toBeNull()
  })

  it('starts 16px to the side it comes from and fades in', () => {
    expect(STEP_IN_OFFSET_PX).toBe(16)
    expect(stepInKeyframes('forward', false)).toEqual([
      { opacity: 0, transform: 'translateX(16px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ])
    expect(stepInKeyframes('back', false)[0]).toEqual({
      opacity: 0,
      transform: 'translateX(-16px)',
    })
  })

  it('only fades under reduced motion', () => {
    for (const direction of ['forward', 'back'] as const) {
      expect(stepInKeyframes(direction, true)).toEqual([
        { opacity: 0 },
        { opacity: 1 },
      ])
    }
  })

  it('takes the shared timings: 200ms, and 150ms for the fade', () => {
    expect(`${STEP_IN_MS}ms`).toBe(sdlMotion.duration.moderate)
    expect(`${STEP_IN_FADE_MS}ms`).toBe(sdlMotion.duration.base)
  })
})

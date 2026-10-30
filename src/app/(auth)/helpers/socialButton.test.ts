import { describe, expect, it } from 'vitest'

import { formSpace } from '@/theme/styles'

import {
  GOOGLE_BUTTON_MIN_W,
  GOOGLE_BUTTON_NATIVE_HEIGHT,
  SOCIAL_BUTTON_SCALE,
  googleButtonDrawing,
  socialButtonPx,
} from './socialButton'

describe('social button scale', () => {
  it('takes Google 40px button to the form control height', () => {
    expect(GOOGLE_BUTTON_NATIVE_HEIGHT * SOCIAL_BUTTON_SCALE).toBe(
      formSpace.controlHeight,
    )
    expect(formSpace.controlHeight).toBe(48)
    expect(SOCIAL_BUTTON_SCALE).toBeCloseTo(1.2, 10)
  })

  it('grows Apple padding, text and logo by the same scale', () => {
    expect(socialButtonPx(12)).toBe(14.4)
    expect(socialButtonPx(8)).toBe(9.6)
    expect(socialButtonPx(14)).toBe(16.8)
    expect(socialButtonPx(18)).toBe(21.6)
    expect(socialButtonPx(0.25)).toBe(0.3)
  })
})

describe('Google button drawing', () => {
  it('is drawn narrower by the scale, so the scaled button is as wide as the container', () => {
    for (const width of [280, 358, 400]) {
      const { drawnWidth, scale } = googleButtonDrawing(width)
      expect(scale).toBeCloseTo(SOCIAL_BUTTON_SCALE, 10)
      // Floored to a whole px: at most one px short of the container.
      expect(drawnWidth * scale).toBeLessThanOrEqual(width)
      expect(drawnWidth * scale).toBeGreaterThan(width - 2)
    }
  })

  it('keeps the 48 height from the narrowest container that fits Google 200 scaled', () => {
    const { drawnWidth, scale } = googleButtonDrawing(
      GOOGLE_BUTTON_MIN_W * SOCIAL_BUTTON_SCALE,
    )
    expect(drawnWidth).toBe(GOOGLE_BUTTON_MIN_W)
    expect(GOOGLE_BUTTON_NATIVE_HEIGHT * scale).toBeCloseTo(48, 10)
  })

  it('never scales past the container: a 208px dialog (a 280px phone) is not clipped', () => {
    const { drawnWidth, scale } = googleButtonDrawing(208)
    expect(drawnWidth).toBe(GOOGLE_BUTTON_MIN_W)
    expect(drawnWidth * scale).toBeLessThanOrEqual(208)
    expect(scale).toBeLessThan(SOCIAL_BUTTON_SCALE)
    expect(scale).toBeGreaterThan(1)
  })

  it('shrinks Google below its own minimum rather than clip it', () => {
    const { drawnWidth, scale } = googleButtonDrawing(150)
    expect(drawnWidth * scale).toBeLessThanOrEqual(150)
  })
})

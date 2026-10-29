import { describe, expect, it } from 'vitest'

import { formSpace } from '@/theme/styles'

import {
  GOOGLE_BUTTON_NATIVE_HEIGHT,
  SOCIAL_BUTTON_SCALE,
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

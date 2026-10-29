import { formSpace } from '@/theme/styles'

/**
 * Google draws its button 40px tall at the largest size, and it cannot be
 * restyled (it provides the ID token the API verifies). It is drawn at 40 and
 * scaled up to the form control height (48), as tall as the fields and the main
 * button; Apple's button, which follows Google's look, is built at 48 from the
 * same scale.
 */
export const GOOGLE_BUTTON_NATIVE_HEIGHT = 40

/** 1.2: how much Google's button is scaled, and Apple's metrics are grown. */
export const SOCIAL_BUTTON_SCALE =
  formSpace.controlHeight / GOOGLE_BUTTON_NATIVE_HEIGHT

/** A px length of Google's 40px button, grown to the form control height. */
export function socialButtonPx(nativePx: number): number {
  return Math.round(nativePx * SOCIAL_BUTTON_SCALE * 100) / 100
}

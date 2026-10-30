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

/** Google's own narrowest width for its button, in px (its range is 200 to 400). */
export const GOOGLE_BUTTON_MIN_W = 200

/**
 * How Google's button is drawn to fill a container `containerWidth` px wide:
 * the width it is asked for (`drawnWidth`) and the scale it is shown at.
 *
 * Normally that is {@link SOCIAL_BUTTON_SCALE}, drawn narrower so the scaled
 * button is as wide as the container. Google cannot draw under 200, so a
 * container narrower than 200 * 1.2 (a dialog on a 280px phone) would clip the
 * scaled button: there the scale follows the container down instead, and the
 * button is a little shorter than 48 rather than cut off.
 */
export function googleButtonDrawing(containerWidth: number): {
  drawnWidth: number
  scale: number
} {
  const scale = Math.min(
    SOCIAL_BUTTON_SCALE,
    containerWidth / GOOGLE_BUTTON_MIN_W,
  )
  return {
    drawnWidth: Math.max(
      GOOGLE_BUTTON_MIN_W,
      Math.floor(containerWidth / scale),
    ),
    scale,
  }
}

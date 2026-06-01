import { pinTransition } from './animation'

/**
 * Distance (px) the layer starts below its resting position while hidden.
 * It fades in while sliding up, so the popup "jumps in" from the bottom.
 */
export const FADE_FROM_BOTTOM_OFFSET_PX = 12

/** Anchor the motion to the bottom edge (the pin side). */
export const FADE_FROM_BOTTOM_ORIGIN = 'bottom center'

export type FadeFromBottomOptions = {
  motion: boolean
  offsetPx?: number
}

export type FadeFromBottomStyle = {
  opacity: string
  transform: string
}

/** `transition` for a bottom-anchored fade/slide layer. */
export function fadeFromBottomTransition(motion: boolean): string {
  return pinTransition(motion, ['opacity', 'transform'])
}

/**
 * Hidden: transparent and shifted down toward the pin.
 * Visible: opaque, at rest.
 */
export function fadeFromBottomStyle(
  visible: boolean,
  options: FadeFromBottomOptions,
): FadeFromBottomStyle {
  const { motion, offsetPx = FADE_FROM_BOTTOM_OFFSET_PX } = options

  if (visible) {
    return { opacity: '1', transform: 'translateY(0)' }
  }

  return {
    opacity: '0',
    transform: motion ? `translateY(${offsetPx}px)` : 'translateY(0)',
  }
}

/** Set the static motion properties once when the layer is created. */
export function mountFadeFromBottom(el: HTMLElement, motion: boolean): void {
  Object.assign(el.style, {
    transformOrigin: FADE_FROM_BOTTOM_ORIGIN,
    transition: fadeFromBottomTransition(motion),
    willChange: motion ? 'opacity, transform' : 'auto',
  })
}

/** Apply the show/hide state to a mounted fade-from-bottom layer. */
export function applyFadeFromBottom(
  el: HTMLElement,
  visible: boolean,
  options: FadeFromBottomOptions,
): void {
  const { opacity, transform } = fadeFromBottomStyle(visible, options)
  el.style.opacity = opacity
  el.style.transform = transform
}

/**
 * How a list's cards arrive (motion group D, Ryan 22 Nov; wiki
 * Foundations-Elevation-Motion). Everyday motion stays under 300ms: a card
 * takes 200ms on the decelerate curve, and cards follow each other 60ms
 * apart up to 200ms, so the last one has landed 400ms after the first began.
 * (It was 420ms with up to 420ms more: a late card took 0.8s.)
 *
 * Numbers for `motion/react`, which wants seconds and a curve as four
 * numbers; they mirror `sdlMotion.duration.moderate` and
 * `sdlMotion.easing.decelerate`.
 */
export const LIST_ENTER = {
  seconds: 0.2,
  staggerSeconds: 0.06,
  maxDelaySeconds: 0.2,
  ease: [0, 0, 0, 1],
} as const

/** When the card at `index` starts: 60ms after the one before, never later than 200ms. */
export function listEnterDelay(index: number): number {
  return Math.min(
    Math.max(0, index) * LIST_ENTER.staggerSeconds,
    LIST_ENTER.maxDelaySeconds,
  )
}

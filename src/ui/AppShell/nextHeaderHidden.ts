export const HEADER_HIDE_TOP_REVEAL_PX = 16
export const HEADER_HIDE_MIN_DELTA_PX = 8
/** Larger than hide so layout/snap jitter during a downward fling cannot re-show. */
export const HEADER_REVEAL_MIN_DELTA_PX = 28
/** Hold the tucked state through the hide animation so collapse cannot bounce. */
export const HEADER_HIDE_LOCK_MS = 280

type NextHeaderHiddenArgs = {
  hidden: boolean
  y: number
  lastY: number
  topReveal?: number
  minDelta?: number
  revealDelta?: number
}

/**
 * Hide the shell header while scrolling down; show it while scrolling up.
 * Always shown near the top so bounce / short pages do not tuck it away.
 * Reveal needs a bigger reverse delta than hide so a fast downward fling
 * that dips scrollTop (header collapse, title snap, anchoring) stays tucked.
 */
export function nextHeaderHidden({
  hidden,
  y,
  lastY,
  topReveal = HEADER_HIDE_TOP_REVEAL_PX,
  minDelta = HEADER_HIDE_MIN_DELTA_PX,
  revealDelta = HEADER_REVEAL_MIN_DELTA_PX,
}: NextHeaderHiddenArgs): boolean {
  if (y <= topReveal) return false
  const delta = y - lastY
  if (delta > minDelta) return true
  if (delta < -revealDelta) return false
  return hidden
}

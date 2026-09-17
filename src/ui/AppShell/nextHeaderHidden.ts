export const HEADER_HIDE_TOP_REVEAL_PX = 16
export const HEADER_HIDE_MIN_DELTA_PX = 8

type NextHeaderHiddenArgs = {
  hidden: boolean
  y: number
  lastY: number
  topReveal?: number
  minDelta?: number
}

/**
 * Hide the shell header while scrolling down; show it while scrolling up.
 * Always shown near the top so bounce / short pages do not tuck it away.
 */
export function nextHeaderHidden({
  hidden,
  y,
  lastY,
  topReveal = HEADER_HIDE_TOP_REVEAL_PX,
  minDelta = HEADER_HIDE_MIN_DELTA_PX,
}: NextHeaderHiddenArgs): boolean {
  if (y <= topReveal) return false
  const delta = y - lastY
  if (delta > minDelta) return true
  if (delta < -minDelta) return false
  return hidden
}

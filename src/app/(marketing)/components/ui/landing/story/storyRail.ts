/**
 * The sideways story on phones (FE-542, Ryan's review of push 1): while an
 * act is pinned under the index row, its steps ride across as the visitor
 * scrolls down, and a phone docked at the screen's foot shows the step in
 * view. Pure, so the scroll maths is unit-tested without a browser.
 *
 * An act takes `railTravel(count)` steps of scroll. Each step first holds
 * still, so it can be read with its screen, then moves on to the next; the
 * last one holds too before the act lets go of the screen.
 */

/** The share of each step's scroll in which it holds still. */
export const RAIL_HOLD = 0.45

/** The scroll one step takes, in `lvh` (a share of the screen's height). */
export const RAIL_STEP_LVH = 70

/** The gap between two cards, and how much of the next one shows, in px. */
export const RAIL_GAP_PX = 16
export const RAIL_PEEK_PX = 36

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Eases in and out of each move (smoothstep). */
const ease = (t: number) => t * t * (3 - 2 * t)

/** The scroll an act of `count` steps takes while pinned, in steps. */
export function railTravel(count: number): number {
  return Math.max(0, count - 1) + RAIL_HOLD
}

/**
 * Where the track is, in cards (0: the first card in place, 1: the second),
 * for a scroll `raw` steps into the pinned act. Before the act it is the
 * first card; after it, the last.
 */
export function railPosition(raw: number, count: number): number {
  if (count <= 1 || !Number.isFinite(raw)) return 0
  const r = clamp(raw, 0, railTravel(count))
  const step = Math.floor(r)
  if (step >= count - 1) return count - 1
  const t = r - step
  return step + ease(clamp((t - RAIL_HOLD) / (1 - RAIL_HOLD), 0, 1))
}

/** The step in view: the card nearest its place. */
export function railIndex(position: number, count: number): number {
  return clamp(Math.round(position), 0, Math.max(0, count - 1))
}

/** Where a link to step `index` lands, in steps into the act: mid-hold. */
export function railAnchor(index: number): number {
  return index + RAIL_HOLD / 2
}

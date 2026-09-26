import type { DrawerPlacement } from './Drawer'

/** Fraction of travel past which a gentle release dismisses. */
export const SHEET_DISMISS_RATIO = 0.35

/**
 * px/s along the dismiss axis. At or above this the release is a flick:
 * settle may use a slight bounce. Gentler releases stay critically damped.
 */
export const SHEET_FLICK_VELOCITY = 800

/** How much release velocity is projected onto offset before the threshold check. */
export const SHEET_PROJECT_SECONDS = 0.18

/** Visual settle time for a critically damped spring (Motion `bounce: 0`). */
export const SHEET_SETTLE_DURATION = 0.45

/** Underdamped only for flicks — enough to feel the handoff, not a rubber settle. */
export const SHEET_FLICK_BOUNCE = 0.16
export const SHEET_FLICK_DURATION = 0.5

/** Resistance while pulling past the open or closed edge. */
export const SHEET_RUBBER = 0.35

/** Resting finger travel before a drag locks. In-flight grabs track sooner. */
export const SHEET_SLOP_PX = 10
export const SHEET_IN_FLIGHT_SLOP_PX = 2

export type SheetDir = 'ltr' | 'rtl'

export type SheetAxis = {
  axis: 'x' | 'y'
  /** +1: positive client delta moves toward dismiss. */
  sign: 1 | -1
}

export type SheetTransition =
  | { type: 'snap' }
  | { type: 'spring'; bounce: number; duration: number }

export function sheetAxis(
  placement: DrawerPlacement,
  dir: SheetDir,
): SheetAxis {
  if (placement === 'bottom') return { axis: 'y', sign: 1 }
  if (placement === 'top') return { axis: 'y', sign: -1 }
  if (placement === 'end') return { axis: 'x', sign: dir === 'rtl' ? -1 : 1 }
  return { axis: 'x', sign: dir === 'rtl' ? 1 : -1 }
}

/** Positive result moves the sheet toward closed. */
export function clientDeltaToOffset(
  dx: number,
  dy: number,
  axis: SheetAxis,
): number {
  return (axis.axis === 'x' ? dx : dy) * axis.sign
}

export function offsetToTranslate(
  offset: number,
  axis: SheetAxis,
): { x: number; y: number } {
  if (axis.axis === 'y') return { x: 0, y: axis.sign * offset }
  return { x: axis.sign * offset, y: 0 }
}

/** Percentage transform matching a fully dismissed sheet (before it is measured). */
export function offscreenTransform(
  placement: DrawerPlacement,
  dir: SheetDir,
): string {
  const axis = sheetAxis(placement, dir)
  if (axis.axis === 'y') return `translate3d(0, ${axis.sign * 100}%, 0)`
  return `translate3d(${axis.sign * 100}%, 0, 0)`
}

export function translate3d(x: number, y: number): string {
  return `translate3d(${x}px, ${y}px, 0)`
}

export function scrimOpacity(offset: number, travel: number): number {
  if (travel <= 0) return offset <= 0 ? 1 : 0
  const progress = Math.min(1, Math.max(0, offset / travel))
  return 1 - progress
}

/**
 * Diminishing offset past the open (negative) or closed (past travel) edge.
 * Inside the range the finger maps 1:1.
 */
export function rubberBandOffset(raw: number, travel: number): number {
  if (travel <= 0) return raw
  if (raw < 0) {
    const over = -raw
    const band = (over * SHEET_RUBBER * travel) / (over + SHEET_RUBBER * travel)
    return -band
  }
  if (raw > travel) {
    const over = raw - travel
    const band = (over * SHEET_RUBBER * travel) / (over + SHEET_RUBBER * travel)
    return travel + band
  }
  return raw
}

export function resolveSheetSettle(input: {
  offset: number
  travel: number
  velocity: number
}): { target: 'open' | 'closed'; flick: boolean } {
  const travel = Math.max(input.travel, 1)
  const { offset, velocity } = input
  if (velocity >= SHEET_FLICK_VELOCITY) return { target: 'closed', flick: true }
  if (velocity <= -SHEET_FLICK_VELOCITY) return { target: 'open', flick: true }
  const projected = offset + velocity * SHEET_PROJECT_SECONDS
  const dismissAt = travel * SHEET_DISMISS_RATIO
  if (projected > dismissAt || offset > dismissAt) {
    return { target: 'closed', flick: false }
  }
  return { target: 'open', flick: false }
}

/**
 * Motion maps `bounce: 0` to damping ratio 1 (critically damped — no overshoot).
 * A positive bounce is underdamped and reserved for flicks.
 * Reduced motion snaps; it does not spring.
 */
export function sheetTransition(
  flick: boolean,
  reducedMotion: boolean,
): SheetTransition {
  if (reducedMotion) return { type: 'snap' }
  if (flick) {
    return {
      type: 'spring',
      bounce: SHEET_FLICK_BOUNCE,
      duration: SHEET_FLICK_DURATION,
    }
  }
  return { type: 'spring', bounce: 0, duration: SHEET_SETTLE_DURATION }
}

export function velocityFromSamples(
  samples: readonly { t: number; offset: number }[],
): number {
  if (samples.length < 2) return 0
  const last = samples[samples.length - 1]
  if (!last) return 0
  let anchor = samples[0]
  if (!anchor) return 0
  for (let i = samples.length - 2; i >= 0; i--) {
    const sample = samples[i]
    if (!sample) continue
    anchor = sample
    if (last.t - sample.t >= 32) break
  }
  const dt = last.t - anchor.t
  if (dt <= 0) return 0
  return ((last.offset - anchor.offset) / dt) * 1000
}

export function scrollCanAbsorb(
  el: { scrollTop: number; scrollHeight: number; clientHeight: number },
  deltaTowardDismiss: number,
): boolean {
  const max = el.scrollHeight - el.clientHeight
  if (max <= 1) return false
  if (deltaTowardDismiss > 0) return el.scrollTop > 0
  if (deltaTowardDismiss < 0) return el.scrollTop < max - 1
  return false
}

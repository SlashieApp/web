/**
 * A step of a flow arriving from the side you are heading to (Post a task
 * motion; Ryan 22 Nov). The same numbers as the `step-in-forward` /
 * `step-in-back` keyframes Post a task's own layout runs: 16px, 200ms, the
 * decelerate curve, no exit; under reduced motion a 150ms fade.
 */
export type StepDirection = 'forward' | 'back'

/** `sdlMotion.duration.moderate`. */
export const STEP_IN_MS = 200
/** `sdlMotion.duration.base`: the reduced-motion fade. */
export const STEP_IN_FADE_MS = 150
/** How far the step travels. */
export const STEP_IN_OFFSET_PX = 16

/**
 * Which way a change of step travels: later in the flow is forward, earlier
 * is back. Null on arrival (no step before), when it stays put, or for a
 * one-screen flow (no index).
 */
export function stepDirectionBetween(
  before: number | undefined,
  now: number | undefined,
): StepDirection | null {
  if (before === undefined || now === undefined || before === now) return null
  return now > before ? 'forward' : 'back'
}

/** The frames a step runs through as it arrives; a fade only under reduced motion. */
export function stepInKeyframes(
  direction: StepDirection,
  reducedMotion: boolean,
): Keyframe[] {
  if (reducedMotion) return [{ opacity: 0 }, { opacity: 1 }]
  const from = direction === 'forward' ? STEP_IN_OFFSET_PX : -STEP_IN_OFFSET_PX
  return [
    { opacity: 0, transform: `translateX(${from}px)` },
    { opacity: 1, transform: 'translateX(0)' },
  ]
}

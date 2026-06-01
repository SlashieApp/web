/** Shared motion tokens for map pins (see slashie-design skill). */
export const PIN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
export const PIN_ANIM_MS = 240
export const PIN_ANIM = `${PIN_ANIM_MS}ms ${PIN_EASE}`

/** Gap between pill and dot when the pill is visible. */
export const PIN_STACK_GAP_PX = 6
/** Space between the expanded popup and the dot (larger = further away). */
export const POPUP_ABOVE_DOT_PX = 4

export const HOVER_OPEN_DELAY_MS = 120
export const HOVER_CLOSE_DELAY_MS = 160

export function pinMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** CSS `transition` value, or `none` when motion is reduced. */
export function pinTransition(motion: boolean, properties: string[]): string {
  if (!motion) return 'none'
  return properties.map((p) => `${p} ${PIN_ANIM}`).join(', ')
}

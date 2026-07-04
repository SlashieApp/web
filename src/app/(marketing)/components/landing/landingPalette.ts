import { BRAND_INK, BRAND_PRIMARY, brandPrimary } from '@/theme/brand'

/**
 * Landing WebGL palette. Raw values are required here because WebGL uniforms
 * and generated sprite textures cannot read CSS variables. Every value mirrors
 * an SDL semantic token in `src/theme/chakraSystem.ts`:
 *
 * - ink surfaces  -> `bg.inverted` / `bg.invertedSurface` / `bg.invertedRaised`
 * - on-ink text   -> `text.onInverted` / `text.onInvertedMuted`
 * - greens        -> `action.primary` (#00DC82) + accent green (green.300)
 *
 * GREEN-INK RULE: any green fill (pins, £ beacons) pairs with dark ink
 * (#0A1512) — never white — in every mode.
 */
export const LANDING_INK = {
  /** bg.inverted — hero canvas base. */
  canvas: '#0C1310',
  /** bg.invertedSurface — terrain low tone. */
  surface: '#121A16',
  /** bg.invertedRaised — terrain high tone. */
  raised: '#1F2A25',
} as const

export const LANDING_ON_INK = {
  /** text.onInverted */
  default: '#F2F5F4',
  /** text.onInvertedMuted — contour/grid lines. */
  muted: '#A6AFAB',
} as const

export const LANDING_GREEN = {
  /** action.primary — the only saturated glow in the scene. */
  primary: BRAND_PRIMARY,
  /** green.300 — map-pin/connection accent on dark. */
  accent: brandPrimary[300],
  /** Ink for text ON green fills (green-ink rule). */
  ink: BRAND_INK,
  /** action.primary at 10% — the DOM cursor-glow gradient stop. */
  cursorGlow: 'rgba(0, 220, 130, 0.1)',
} as const

/** £ labels shown on the floating beacon pins (quote moments are green). */
export const BEACON_PRICES = ['£45', '£80', '£120', '£150', '£220'] as const

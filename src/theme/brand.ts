/**
 * SDL green ramp + named aliases for NON-Chakra consumers only (Mapbox layers,
 * SVG fills, `<meta theme-color>`, stories). Feature components must use Chakra
 * SEMANTIC tokens (`action.primary`, `text.link`, …), never these constants.
 *
 * This ramp MUST mirror `tokens.colors.green` in `./chakraSystem`.
 */
export const brandPrimary = {
  50: '#E7FBF0',
  100: '#C6F6DD',
  200: '#92ECC0',
  300: '#54DD9D',
  400: '#00DC82',
  500: '#00C275',
  600: '#02A567',
  700: '#048654',
  800: '#05683F',
  900: '#053D27',
} as const

/** Brand green = SDL green-400 (action.primary). Dark ink text on green, never white. */
export const BRAND_PRIMARY = '#00DC82'
export const BRAND_PRIMARY_HOVER = '#00C275'
export const BRAND_PRIMARY_PRESSED = '#02A567'
export const BRAND_INK = '#0A1512'
export const BRAND_SECONDARY = '#048654'
export const BRAND_PRIMARY_SOFT_BG = '#C6F6DD'
export const BRAND_PRIMARY_SOFT_FG = '#048654'

/**
 * Map accent colors for raw Mapbox/SVG consumers. Brand green pins/routes per spec;
 * `BRAND_MAP_PIN_HEX` is the same value without the leading `#` for the Static Images API.
 */
export const BRAND_MAP_PIN = BRAND_PRIMARY
export const BRAND_MAP_PIN_HEX = BRAND_PRIMARY.slice(1)
/** White outline around the map pin for contrast against the basemap (raw SVG only). */
export const BRAND_MAP_PIN_STROKE = '#FFFFFF'
export const BRAND_MAP_ROUTE = BRAND_PRIMARY
/** Approximate-radius zone overlay on browse/detail maps (brand green). */
export const BRAND_MAP_RADIUS = BRAND_PRIMARY

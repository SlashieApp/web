/**
 * Camera padding (Mapbox `padding`) that frames the pin in the visible map
 * window. Compact (phone + tablet) uses a top hero band; web view pushes the
 * pin into the top-right quadrant beside the content column.
 */

export type OffsetMapVariant = 'exact' | 'approximate'

export type OffsetPadding = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type OffsetCompactRecipe = {
  top: number
  right: number
  heroMin: number
  heroMax: number
  heroRatio: number
}

export type OffsetWebRecipe = {
  top: number
  right: number
  leftRatio: number
  bottomRatio: Record<OffsetMapVariant, number>
}

export const OFFSET_MOBILE: OffsetCompactRecipe = {
  top: 48,
  right: 20,
  heroMin: 280,
  heroMax: 360,
  heroRatio: 0.38,
}

/** Tablet uses the same hero-band framing as phone until a dedicated layout. */
export const OFFSET_TABLET: OffsetCompactRecipe = { ...OFFSET_MOBILE }

export const OFFSET_WEB: OffsetWebRecipe = {
  top: 58,
  right: 20,
  leftRatio: 0.5,
  bottomRatio: {
    exact: 0.58,
    approximate: 0.66,
  },
}

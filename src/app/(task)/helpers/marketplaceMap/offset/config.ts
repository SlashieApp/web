/**
 * Camera padding (Mapbox `padding`) that frames the pin in the visible map
 * window. Used on **task-detail** camera only — `/search` browse selection
 * keeps a pin on lat/lng and frames with `leftViewportPadding`, not this
 * inset. Compact (phone + tablet) uses a top hero band; web view pushes the
 * pin into the top-right quadrant beside the content column.
 *
 * `approximate` adds extra bottom inset for the privacy zone on detail.
 * Search selected markers must stay `exact` (pin, not zone).
 */

import { COMPACT_DETAIL_HERO_H } from '../overlay/config'

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

function cssPx(value: `${number}px`): number {
  return Number.parseInt(value, 10)
}

const MOBILE_HERO_PX = cssPx(COMPACT_DETAIL_HERO_H.base)
const TABLET_HERO_PX = cssPx(COMPACT_DETAIL_HERO_H.md)

export const OFFSET_MOBILE: OffsetCompactRecipe = {
  top: 48,
  right: 20,
  heroMin: MOBILE_HERO_PX,
  heroMax: MOBILE_HERO_PX,
  heroRatio: 1,
}

/** Tablet uses the same compact framing; only the hero band is taller. */
export const OFFSET_TABLET: OffsetCompactRecipe = {
  ...OFFSET_MOBILE,
  heroMin: TABLET_HERO_PX,
  heroMax: TABLET_HERO_PX,
}

export const OFFSET_WEB: OffsetWebRecipe = {
  top: 58,
  right: 20,
  leftRatio: 0.5,
  bottomRatio: {
    exact: 0.58,
    approximate: 0.66,
  },
}

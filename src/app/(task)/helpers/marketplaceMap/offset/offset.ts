import {
  type MarketplaceMapViewport,
  marketplaceMapViewport,
} from '../viewport'
import {
  OFFSET_MOBILE,
  OFFSET_TABLET,
  OFFSET_WEB,
  type OffsetCompactRecipe,
  type OffsetMapVariant,
  type OffsetPadding,
} from './config'

function compactPadding(
  recipe: OffsetCompactRecipe,
  width: number,
  height: number,
): OffsetPadding {
  const hero = Math.min(
    recipe.heroMax,
    Math.max(recipe.heroMin, Math.round(height * recipe.heroRatio)),
  )
  return {
    top: recipe.top,
    left: Math.min(24, Math.max(16, Math.round(width * 0.04))),
    right: recipe.right,
    bottom: Math.max(48, height - hero),
  }
}

/**
 * Phone: keep the pin inside the ~300px hero band above overlapping chrome.
 */
export function offsetPaddingForMobile(
  width: number,
  height: number,
): OffsetPadding {
  return compactPadding(OFFSET_MOBILE, width, height)
}

/**
 * Tablet: same hero-band framing as phone (carousel + header still overlay
 * the map below `lg`).
 */
export function offsetPaddingForTablet(
  width: number,
  height: number,
): OffsetPadding {
  return compactPadding(OFFSET_TABLET, width, height)
}

/**
 * Web view: pin sits in the visible top-right quadrant (left half is content).
 */
export function offsetPaddingForWeb(
  width: number,
  height: number,
  variant: OffsetMapVariant = 'exact',
): OffsetPadding {
  return {
    top: OFFSET_WEB.top,
    left: Math.round(width * OFFSET_WEB.leftRatio),
    right: OFFSET_WEB.right,
    bottom: Math.round(height * OFFSET_WEB.bottomRatio[variant]),
  }
}

export function offsetPaddingForViewport(
  viewport: MarketplaceMapViewport,
  width: number,
  height: number,
  variant: OffsetMapVariant = 'exact',
): OffsetPadding {
  if (viewport === 'web') return offsetPaddingForWeb(width, height, variant)
  if (viewport === 'tablet') return offsetPaddingForTablet(width, height)
  return offsetPaddingForMobile(width, height)
}

export function marketplaceMapViewPadding(
  width: number,
  height: number,
  variant: OffsetMapVariant,
): OffsetPadding | undefined {
  if (width <= 0 || height <= 0) return undefined
  return offsetPaddingForViewport(
    marketplaceMapViewport(width),
    width,
    height,
    variant,
  )
}

/**
 * Marketplace map viewports. Width is enough because the map shell is
 * viewport-sized. Matches Chakra `md` (48em) and `lg` (62em).
 */
export type MarketplaceMapViewport = 'mobile' | 'tablet' | 'web'

export const MARKETPLACE_MAP_TABLET_MIN_PX = 768
export const MARKETPLACE_MAP_WEB_MIN_PX = 992

export function marketplaceMapViewport(width: number): MarketplaceMapViewport {
  if (width >= MARKETPLACE_MAP_WEB_MIN_PX) return 'web'
  if (width >= MARKETPLACE_MAP_TABLET_MIN_PX) return 'tablet'
  return 'mobile'
}

export function marketplaceMapIsDesktopWidth(width: number): boolean {
  return marketplaceMapViewport(width) === 'web'
}

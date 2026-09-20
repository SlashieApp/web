import { TABLET_MIN_PX, WEB_MIN_PX } from '@/theme/breakpoints'

/**
 * Marketplace map viewports. Width is enough because the map shell is
 * viewport-sized. Matches the shared Chakra `md` / `lg` tokens.
 */
export type MarketplaceMapViewport = 'mobile' | 'tablet' | 'web'

export const MARKETPLACE_MAP_TABLET_MIN_PX = TABLET_MIN_PX
export const MARKETPLACE_MAP_WEB_MIN_PX = WEB_MIN_PX

export function marketplaceMapViewport(width: number): MarketplaceMapViewport {
  if (width >= MARKETPLACE_MAP_WEB_MIN_PX) return 'web'
  if (width >= MARKETPLACE_MAP_TABLET_MIN_PX) return 'tablet'
  return 'mobile'
}

export function marketplaceMapIsDesktopWidth(width: number): boolean {
  return marketplaceMapViewport(width) === 'web'
}

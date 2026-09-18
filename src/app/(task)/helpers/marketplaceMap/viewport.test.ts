import { describe, expect, it } from 'vitest'

import {
  MARKETPLACE_MAP_TABLET_MIN_PX,
  MARKETPLACE_MAP_WEB_MIN_PX,
  marketplaceMapViewport,
} from './viewport'

describe('marketplaceMapViewport', () => {
  it('classifies phone, tablet, and web from width', () => {
    expect(marketplaceMapViewport(390)).toBe('mobile')
    expect(marketplaceMapViewport(MARKETPLACE_MAP_TABLET_MIN_PX - 1)).toBe(
      'mobile',
    )
    expect(marketplaceMapViewport(MARKETPLACE_MAP_TABLET_MIN_PX)).toBe('tablet')
    expect(marketplaceMapViewport(MARKETPLACE_MAP_WEB_MIN_PX - 1)).toBe(
      'tablet',
    )
    expect(marketplaceMapViewport(MARKETPLACE_MAP_WEB_MIN_PX)).toBe('web')
  })
})

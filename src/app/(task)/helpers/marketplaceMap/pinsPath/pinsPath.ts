import type { OffsetMapVariant } from '../offset/config'
import type { MarketplaceMapViewport } from '../viewport'
import { PINS_PATH_LINE_WIDTH, PINS_PATH_Z_INDEX } from './config'

export type PinsPathContext = {
  inDetail: boolean
  variant: OffsetMapVariant
}

export type PinsPathPresentation = {
  /** Browse shows every pin; detail solos the target (or hides pins in a zone). */
  taskPinMode: 'all' | 'solo' | 'none'
  lineWidth: number
  pinZIndex: typeof PINS_PATH_Z_INDEX
}

function pinsPathForSurface(
  ctx: PinsPathContext,
  lineWidth: number,
): PinsPathPresentation {
  const taskPinMode = ctx.inDetail
    ? ctx.variant === 'approximate'
      ? 'none'
      : 'solo'
    : 'all'
  return {
    taskPinMode,
    lineWidth,
    pinZIndex: PINS_PATH_Z_INDEX,
  }
}

/**
 * Phone: You + path under compact pins; detail keeps only the target pin.
 */
export function pinsPathForMobile(ctx: PinsPathContext): PinsPathPresentation {
  return pinsPathForSurface(ctx, PINS_PATH_LINE_WIDTH.mobile)
}

/**
 * Tablet: same pin/path rules as phone (shared compact map chrome).
 */
export function pinsPathForTablet(ctx: PinsPathContext): PinsPathPresentation {
  return pinsPathForSurface(ctx, PINS_PATH_LINE_WIDTH.tablet)
}

/**
 * Web view: same solo/all rules; camera framing is handled by offset, not pins.
 */
export function pinsPathForWeb(ctx: PinsPathContext): PinsPathPresentation {
  return pinsPathForSurface(ctx, PINS_PATH_LINE_WIDTH.web)
}

export function pinsPathForViewport(
  viewport: MarketplaceMapViewport,
  ctx: PinsPathContext,
): PinsPathPresentation {
  if (viewport === 'web') return pinsPathForWeb(ctx)
  if (viewport === 'tablet') return pinsPathForTablet(ctx)
  return pinsPathForMobile(ctx)
}

/**
 * Desktop split inset the search camera shifts the centre past.
 * Edit this to tune the map centre offset for the desktop split layout.
 */
export const DESKTOP_MAP_CENTER_LEFT_INSET_PX = 420

/** Phones and tablets keep the centre in the middle of the map. */
export const MOBILE_MAP_CENTER_LEFT_INSET_PX = 0

export type MapCenterPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Pixels from the map box centre to where the geographic centre is drawn.
 * Positive x is to the right. Search flies the camera by this so the centre
 * sits in the open map, beside the list. A 0 inset (phones) stays put.
 */
export function mapCenterOffsetPx(leftInset: number): [number, number] {
  return [Math.max(0, (leftInset - 120) / 2), 0]
}

/**
 * Mapbox padding that puts `getCenter()` on that same point. The vanishing
 * point shifts by half the left/right (and top/bottom) difference, so a
 * 150px right offset is 300px of left padding.
 */
export function paddingForMapCenterOffset(
  offset: readonly [number, number],
): MapCenterPadding {
  const [x, y] = offset
  return {
    top: Math.max(0, y * 2),
    bottom: Math.max(0, -y * 2),
    left: Math.max(0, x * 2),
    right: Math.max(0, -x * 2),
  }
}

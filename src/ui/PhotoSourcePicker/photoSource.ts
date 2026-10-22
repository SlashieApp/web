/** Phones and tablets: no hover, and a finger as the main pointer. */
export const TOUCH_SCREEN_QUERY = '(hover: none) and (pointer: coarse)'

/**
 * Whether the photo button offers Take photo or Choose from library (a touch
 * screen) instead of opening the file picker straight away (a mouse or
 * trackpad, where browsers have no camera to offer). Asked at tap time, so a
 * tablet that gains or loses a keyboard and trackpad answers correctly.
 */
export function offersCamera(view: {
  matchMedia?: (query: string) => { matches: boolean }
}): boolean {
  return view.matchMedia?.(TOUCH_SCREEN_QUERY).matches ?? false
}

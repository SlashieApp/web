/** Zoom and pan of the previewed photo: a scale, plus its offset in px from the stage centre. */
export type PreviewView = { scale: number; x: number; y: number }

export type Point = { x: number; y: number }

export type Size = { width: number; height: number }

export const MIN_ZOOM = 1
export const MAX_ZOOM = 4

/** Fitted to the screen and centred. */
export const REST_VIEW: PreviewView = { scale: 1, x: 0, y: 0 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/**
 * Keeps the scale within 1x to 4x and the photo on screen. `photo` is its
 * fitted size at 1x. A side wider than the stage pans until its edge meets
 * the stage edge; a narrower side stays centred.
 */
export function clampView(
  view: PreviewView,
  photo: Size,
  stage: Size,
): PreviewView {
  const scale = clamp(view.scale, MIN_ZOOM, MAX_ZOOM)
  const maxX = Math.max(0, (photo.width * scale - stage.width) / 2)
  const maxY = Math.max(0, (photo.height * scale - stage.height) / 2)
  return {
    scale,
    x: clamp(view.x, -maxX, maxX),
    y: clamp(view.y, -maxY, maxY),
  }
}

/** Zooms to `scale`, keeping `point` (px from the stage centre) where it is. */
export function zoomViewAt(
  view: PreviewView,
  scale: number,
  point: Point,
): PreviewView {
  const next = clamp(scale, MIN_ZOOM, MAX_ZOOM)
  const ratio = next / view.scale
  return {
    scale: next,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  }
}

/**
 * Two fingers moved from `from` to `to`: zoom by how far they spread, around
 * where they started, and follow them as they move together.
 */
export function pinchView(
  start: PreviewView,
  from: [Point, Point],
  to: [Point, Point],
): PreviewView {
  const spread = distance(...to) / (distance(...from) || 1)
  const fromMid = midpoint(...from)
  const toMid = midpoint(...to)
  const zoomed = zoomViewAt(start, start.scale * spread, fromMid)
  return {
    scale: zoomed.scale,
    x: zoomed.x + toMid.x - fromMid.x,
    y: zoomed.y + toMid.y - fromMid.y,
  }
}

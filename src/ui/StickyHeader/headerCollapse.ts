/**
 * The collapsing page header's numbers (FE-458; the app's FE-459 uses the same
 * ones). All lengths are CSS px. Pure: the scroll listener in
 * `attachHeaderCollapse.ts` feeds these with what it reads from the page.
 */

/** The bar is one row this tall. */
export const BAR_H = 56

/** The big title rests this far under the bar. */
export const TITLE_GAP = 8

/** The big title is 34px; the bar's one-line copy is 18px. */
export const TITLE_PX = 34
export const BAR_TITLE_PX = 18

/** The bar copy's left edge, from the content's left edge. */
export const BAR_TITLE_INSET = 40

/** The bar copy's top, from the row's top (a 24px line centred in the row). */
export const BAR_TITLE_TOP = 16

/** The icon buttons are 44px boxes holding a 24px glyph, which sits on the content edge. */
export const BUTTON_BOX = 44
export const GLYPH_PX = 24
export const BUTTON_OVERHANG = (BUTTON_BOX - GLYPH_PX) / 2

/** The bar copy ends this far before the option button's box. */
export const OPTION_GAP = 8

/**
 * Scroll distance of the collapse: from the title's resting top (bar + 8) to
 * the bar copy's top (16px into the row). The moving title travels it one
 * px per px of scroll, so the page's own scrolling carries it.
 */
export const COLLAPSE_DISTANCE = BAR_H + TITLE_GAP - BAR_TITLE_TOP

/** The moving title cross-fades into the bar copy over the last quarter. */
export const CROSSFADE_FROM = 0.75

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * The scroll offset at which the title's top reaches `TITLE_GAP` under the
 * bar: 0 on an ordinary page (the title already rests there), further down
 * where the title rests lower, under a map or cover. Read from the title's
 * current top, so it holds wherever the page has scrolled to.
 */
export function collapseStart(input: {
  scrollY: number
  /** The title's top now, in the viewport (its box, not the moving copy). */
  titleTop: number
  /** The bar's bottom edge once stuck, in the viewport. */
  barBottom: number
}): number {
  return Math.max(
    0,
    input.scrollY + input.titleTop - input.barBottom - TITLE_GAP,
  )
}

/** 0 until the title reaches the bar, 1 once it has travelled its 48px. */
export function collapseProgress(scrollY: number, start: number): number {
  return clamp01((scrollY - start) / COLLAPSE_DISTANCE)
}

/** The moving title's scale: 34px down to 18px, linear in p, from its top left. */
export function titleScale(p: number): number {
  return 1 - clamp01(p) * (1 - BAR_TITLE_PX / TITLE_PX)
}

/**
 * Where the moving title's top left is at p: from its rest (`rest`) to the bar
 * copy's place, `BAR_TITLE_INSET` right of the content's left edge and
 * `BAR_TITLE_TOP` under the row's top. On an ordinary page that is from
 * (content left, bar bottom + 8) to (content left + 40, row top + 16).
 */
export function titlePosition(
  p: number,
  rest: { x: number; y: number },
  bar: { contentLeft: number; rowTop: number },
): { x: number; y: number } {
  const q = clamp01(p)
  const x = bar.contentLeft + BAR_TITLE_INSET
  const y = bar.rowTop + BAR_TITLE_TOP
  return { x: rest.x + (x - rest.x) * q, y: rest.y + (y - rest.y) * q }
}

/** Opacity of the moving title and of the bar copy: handed over at p 0.75 to 1. */
export function crossfade(p: number): { title: number; bar: number } {
  const t = clamp01((p - CROSSFADE_FROM) / (1 - CROSSFADE_FROM))
  return { title: 1 - t, bar: t }
}

export type CollapseFrame = {
  /** Collapse progress, 0 to 1. */
  p: number
  /** The moving title replaces the page's own heading (which hides). */
  moving: boolean
  scale: number
  movingOpacity: number
  barTitleOpacity: number
  /** Opacity of the bar's background where it floats over a map or cover. */
  barBgOpacity: number
}

/**
 * Everything one scroll position needs. Reduced motion has no interpolation:
 * the heading scrolls as any content does, and once `scrollY` is `start` plus
 * 48 the bar copy (and the media bar's background) show at once.
 */
export function collapseFrame(
  scrollY: number,
  start: number,
  reducedMotion: boolean,
): CollapseFrame {
  const distance = scrollY - start
  if (reducedMotion) {
    const done = distance >= COLLAPSE_DISTANCE ? 1 : 0
    return {
      p: done,
      moving: false,
      scale: 1,
      movingOpacity: 0,
      barTitleOpacity: done,
      barBgOpacity: done,
    }
  }
  const p = collapseProgress(scrollY, start)
  const fade = crossfade(p)
  return {
    p,
    moving: distance > 0,
    scale: titleScale(p),
    movingOpacity: fade.title,
    barTitleOpacity: fade.bar,
    barBgOpacity: p,
  }
}

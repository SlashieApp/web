import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { PAGE_CONTAINER_PX } from '@/theme/pageContainer'

/**
 * The layout rules' measures in px, for tests and stories only (the app lays
 * out with the tokens in `theme/pageContainer`). No Storybook import, so unit
 * tests can use it.
 */

/** The same gutters in px (a spacing step is 4px): 16 below md, 24 from md, 32 from lg. */
export const PAGE_GUTTER_PX = { base: 16, md: 24, lg: 32 } as const

/** The page gutter at a viewport width, in px (the container's `px`). */
export function pageGutterPx(viewportWidth: number): number {
  if (viewportWidth >= BREAKPOINT_PX.lg) return PAGE_GUTTER_PX.lg
  if (viewportWidth >= BREAKPOINT_PX.md) return PAGE_GUTTER_PX.md
  return PAGE_GUTTER_PX.base
}

/**
 * The logo line: where the site header's logo, and so every page's own header
 * and content, starts (R1). The container is centred and at most 80rem wide,
 * so it is the gutter plus whatever the viewport has beyond 80rem, halved.
 */
export function logoLineLeft(viewportWidth: number): number {
  const margin = Math.max((viewportWidth - PAGE_CONTAINER_PX) / 2, 0)
  return margin + pageGutterPx(viewportWidth)
}

/** The menu line: where the site header's menu ends (R1), the logo line's mirror. */
export function menuLineRight(viewportWidth: number): number {
  return viewportWidth - logoLineLeft(viewportWidth)
}

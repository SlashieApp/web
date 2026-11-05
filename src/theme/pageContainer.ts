import { BREAKPOINT_PX } from './breakpoints'

/**
 * Shared page column. Same measure as Chakra `Container` (`sizes.page` /
 * worker detail). Header, marketing, dashboard, and overlay UIs align here so
 * full-bleed backgrounds (map, hero) can sit behind contained content.
 *
 * Prefer `<PageContainer>` (`@ui`) for page shells. Use these constants on
 * Box/Grid when a container is not the right element.
 */
export const PAGE_CONTAINER_MAX_W = 'page' as const

/** CSS size for `sizes.page` / Chakra `8xl`. */
export const PAGE_CONTAINER_MAX_W_CSS = '80rem' as const

/** Matches the Container recipe gutters (`px` on `<Container>`). */
export const PAGE_GUTTER_X = { base: 4, md: 6, lg: 8 } as const

/** The same gutters in px (a spacing step is 4px): 16 below md, 24 from md, 32 from lg. */
export const PAGE_GUTTER_PX = { base: 16, md: 24, lg: 32 } as const

/**
 * The readable column of a single-column page (Account, Billing, settings
 * pages, single-column step flows): `sizes.pageColumn`, 45rem, 720px. It is
 * LEFT-aligned on the logo line, never centred in the container (R3).
 */
export const READABLE_COLUMN_MAX_W = 'pageColumn' as const

/** CSS size for `sizes.pageColumn`. */
export const READABLE_COLUMN_MAX_W_CSS = '45rem' as const

/**
 * The one width of every centred card: the auth forms and the status, gate and
 * error cards (R6). `sizes.statusCard`, 28rem, 448px. The card is this wide
 * itself, so gutters go outside it (in the container), not inside.
 */
export const STATUS_CARD_MAX_W = 'statusCard' as const

/** CSS size for `sizes.statusCard`. */
export const STATUS_CARD_MAX_W_CSS = '28rem' as const

/** Desktop search list column: overlays the map inside the page Container. */
export const SEARCH_LIST_COLUMN_W = '460px' as const

/** The page gutter at a viewport width, in px (the container's `px`). */
export function pageGutterPx(viewportWidth: number): number {
  if (viewportWidth >= BREAKPOINT_PX.lg) return PAGE_GUTTER_PX.lg
  if (viewportWidth >= BREAKPOINT_PX.md) return PAGE_GUTTER_PX.md
  return PAGE_GUTTER_PX.base
}

const PAGE_CONTAINER_PX = Number.parseFloat(PAGE_CONTAINER_MAX_W_CSS) * 16

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

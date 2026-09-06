/**
 * Shared page column. Same measure as Chakra `Container` (`sizes.page` /
 * worker detail). Header, marketing, dashboard, and overlay UIs align here so
 * full-bleed backgrounds (map, hero) can sit behind contained content.
 *
 * Prefer `<Container>` for page shells. Use these constants on Box/Grid when
 * Container is not the right element.
 */
export const PAGE_CONTAINER_MAX_W = 'page' as const

/** CSS size for `sizes.page` / Chakra `8xl`. */
export const PAGE_CONTAINER_MAX_W_CSS = '90rem' as const

/** Matches the Container recipe gutters (`px` on `<Container>`). */
export const PAGE_GUTTER_X = { base: 4, md: 6, lg: 8 } as const

/** Desktop search list column — overlays the map inside the page Container. */
export const SEARCH_LIST_COLUMN_W = '460px' as const

/**
 * Viewport left → right edge of the contained search list.
 * Matches `Container` + `PAGE_GUTTER_X` + `SEARCH_LIST_COLUMN_W`.
 */
export const SEARCH_LIST_SCRIM_W = {
  base: `calc(1rem + ${SEARCH_LIST_COLUMN_W})`,
  md: `calc(max(0px, (100% - ${PAGE_CONTAINER_MAX_W_CSS}) / 2) + 1.5rem + ${SEARCH_LIST_COLUMN_W})`,
  lg: `calc(max(0px, (100% - ${PAGE_CONTAINER_MAX_W_CSS}) / 2) + 2rem + ${SEARCH_LIST_COLUMN_W})`,
} as const

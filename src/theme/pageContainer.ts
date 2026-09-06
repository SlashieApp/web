/**
 * Shared page column. Header, marketing, and overlay UIs align to this so
 * full-bleed backgrounds (map, hero) can sit behind contained content.
 */
export const PAGE_CONTAINER_MAX_W = '7xl' as const

/** CSS size for `7xl` — matches task detail (`maxW="7xl"`). */
export const PAGE_CONTAINER_MAX_W_CSS = '80rem' as const

export const PAGE_GUTTER_X = { base: 4, md: 6 } as const

/** Desktop search list column — overlays the map inside the page Container. */
export const SEARCH_LIST_COLUMN_W = '460px' as const

/**
 * Viewport left → right edge of the contained search list.
 * Matches `Container maxW=7xl` + `PAGE_GUTTER_X.md` + `SEARCH_LIST_COLUMN_W`.
 */
export const SEARCH_LIST_SCRIM_W = {
  base: `calc(1rem + ${SEARCH_LIST_COLUMN_W})`,
  md: `calc(max(0px, (100% - ${PAGE_CONTAINER_MAX_W_CSS}) / 2) + 1.5rem + ${SEARCH_LIST_COLUMN_W})`,
} as const

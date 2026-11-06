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

/**
 * The page container's width (`sizes.page`, 80rem) in px. Rails, the landing's
 * scene and the map showcase size themselves to it.
 */
export const PAGE_CONTAINER_PX =
  Number.parseFloat(PAGE_CONTAINER_MAX_W_CSS) * 16

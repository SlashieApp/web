import { PAGE_CONTAINER_MAX_W_CSS } from '@/theme/pageContainer'

/** Shared gutters, gaps, and sticky offset for `/tasks/[slug]`. */
export const TASK_DETAIL_PAGE_GUTTER_X = { base: 4, md: 6 } as const

export const TASK_DETAIL_PAGE_PT = { base: 4, md: 6 } as const

export const TASK_DETAIL_PAGE_PB = { base: 28, md: 10 } as const

/** Gap between status block and main grid. */
export const TASK_DETAIL_PAGE_STACK_GAP = 2

/** Gap between grid columns and major main-column sections. */
export const TASK_DETAIL_SECTION_GAP = { base: 6, md: 8, xl: 8 } as const

/** Gap between stacked sidebar cards (quotes, meta, order panels). */
export const TASK_DETAIL_COLUMN_GAP = 4

/**
 * Desktop task-detail content column. Must be the shared page measure
 * (`sizes.page` / 90rem), never the /search list overlay (`SEARCH_LIST_COLUMN_W`
 * 460px).
 */
export const TASK_DETAIL_COLUMN_MAX_W = PAGE_CONTAINER_MAX_W_CSS

/** Map show-through above the sticky money chrome on `lg+`. */
export const TASK_DETAIL_DESKTOP_MAP_PEEK = '120px'

/**
 * Overview on `lg+` is the pre-regression two-column money page
 * (details | quotes). Below `lg` it is a single stacked column.
 */
export const TASK_DETAIL_OVERVIEW_COLUMNS = {
  base: '1fr',
  lg: 'minmax(0, 1fr) minmax(320px, 400px)',
} as const

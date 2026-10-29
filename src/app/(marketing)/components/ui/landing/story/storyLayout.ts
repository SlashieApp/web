import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

/**
 * Measures the how-it-works section shares: the sticky site header, the
 * horizontal index under it (below `lg`) and where a linked step comes to rest.
 */

/** The sticky site header: its minimum height plus its 1px top and bottom borders. */
export const STORY_HEADER_H = {
  base: `calc(${HEADER_MIN_HEIGHT.base} + 2px)`,
  md: `calc(${HEADER_MIN_HEIGHT.md} + 2px)`,
} as const

/** The horizontal index below `lg`: 45px of link and its 1px hairline. */
export const STORY_INDEX_BAR_H = '46px'

/**
 * Where the index sticks: right under the header below `lg` (a full-width row),
 * 40px under it from `lg` (a list in the left column).
 */
export const STORY_INDEX_TOP = {
  base: STORY_HEADER_H.base,
  md: STORY_HEADER_H.md,
  lg: `calc(${STORY_HEADER_H.md} + 40px)`,
} as const

/**
 * `scroll-margin-top` of a step's row, so a link to it (the index, the hero's
 * "See how it works") lands it clear of the header, and of the index row below
 * `lg`. The row is then across the middle of the viewport, where the story
 * tracker calls a step active: from `lg` its top sits 150px above the middle
 * (a row is at least 300px tall), below `lg` the row is taller than the screen.
 */
export const STORY_STEP_SCROLL_MARGIN = {
  base: `calc(${STORY_HEADER_H.base} + ${STORY_INDEX_BAR_H} + 8px)`,
  md: `calc(${STORY_HEADER_H.md} + ${STORY_INDEX_BAR_H} + 8px)`,
  lg: `max(calc(${STORY_HEADER_H.md} + 24px), calc(50vh - 150px))`,
} as const

/** The least height of a step row from `lg`: long enough for the phone to dwell on it. */
export const STORY_STEP_MIN_H = 'max(300px, 42vh)'

import { COMPACT_DETAIL_HERO_H } from '@/app/(task)/helpers/marketplaceMap/overlay/config'

/**
 * Desktop map show-through above the sticky chrome: ~26% of the window,
 * never shorter than 6rem so the pin still has a band on short screens.
 */
export const TASK_DETAIL_DESKTOP_MAP_SPACER = 'max(6rem, 26dvh)' as const

/**
 * Tab body fills the leftover viewport under the map hero (screen − map min-H).
 */
export const TASK_DETAIL_TAB_BODY_MIN_H = {
  base: `calc(100dvh - ${COMPACT_DETAIL_HERO_H.base})`,
  md: `calc(100dvh - ${COMPACT_DETAIL_HERO_H.md})`,
  lg: `calc(100dvh - ${TASK_DETAIL_DESKTOP_MAP_SPACER})`,
} as const

/** Task detail blocks: cards on desktop, flush on the page below `lg`. */
export const TASK_DETAIL_SECTION_CARD = {
  layout: 'section',
} as const

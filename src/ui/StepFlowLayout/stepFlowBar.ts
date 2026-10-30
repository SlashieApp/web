import { COOKIE_BANNER_HEIGHT_VAR } from '@/app/cookieBannerLayout'
import { pinnedBarClearance } from '@/theme/styles'

/**
 * The attribute a step flow's pinned Back and Continue bar carries, so
 * `globals.css` can give `<html>` room for it while it is on the page.
 */
export const STEP_FLOW_BAR_ATTR = 'data-step-flow-bar'

/**
 * The bottom scroll padding `globals.css` gives `<html>` while a step flow's
 * bar is on the page (WCAG 2.4.11 Focus Not Obscured). On a phone the page
 * scrolls under the bar, so a field or chip that takes keyboard focus would
 * stop behind it. The padding is the bar and the 20 the last field keeps from
 * it (`pinnedBarClearance`), plus the home-indicator inset the bar already
 * pads for, plus the cookie banner's room (0 when it is closed).
 */
export const STEP_FLOW_BAR_SCROLL_PADDING = `calc(var(${COOKIE_BANNER_HEIGHT_VAR}, -16px) + 16px + ${pinnedBarClearance}px + env(safe-area-inset-bottom, 0px))`

/** The rule, as `globals.css` has it: stories inject it, since they do not load `globals.css`. */
export const STEP_FLOW_BAR_RULE = `html:has([${STEP_FLOW_BAR_ATTR}]) { scroll-padding-bottom: ${STEP_FLOW_BAR_SCROLL_PADDING}; }`

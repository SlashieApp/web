// Layout constants only: map helpers import these without pulling the nav
// (and its user store / GraphQL imports) into their bundles and tests.

/**
 * Space under scrollable content so the last row stays reachable above the
 * fade + floating pill. Taller than the pill alone so the dissolve has runway.
 */
export const MOBILE_BOTTOM_NAV_CLEARANCE =
  'calc(96px + env(safe-area-inset-bottom, 0px))' as const

/**
 * Sit floating chrome (search carousel) just above the raised create button.
 * Tighter than {@link MOBILE_BOTTOM_NAV_CLEARANCE}, which leaves fade runway
 * for scrolling pages. Must clear the `mt={-5}` FAB (~20px above the pill).
 */
export const MOBILE_BOTTOM_NAV_OFFSET =
  'calc(88px + env(safe-area-inset-bottom, 0px))' as const

/** Widest the floating pill grows; other floating bars match it. */
export const MOBILE_BOTTOM_NAV_MAX_W = '580px' as const

export const MESSAGES_HREF = '/messages' as const

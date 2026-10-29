/**
 * The cookie banner's height, published on `<html>` while the banner is open
 * and removed when it closes. Anything fixed to the bottom of the screen reads
 * it to sit above the banner instead of under it:
 * `bottom: calc(var(--cookie-banner-height, 0px) + 16px)`.
 */
export const COOKIE_BANNER_HEIGHT_VAR = '--cookie-banner-height'

/**
 * The bottom scroll padding `globals.css` gives `<html>` (WCAG 2.4.11 Focus Not
 * Obscured): the open banner's height plus 16px of air, so a control that takes
 * keyboard focus, or a card that scrolls into view, stops above the banner
 * instead of under it. The -16px fallback makes it 0 when the banner is closed
 * (the variable is unset), so nothing else on the site moves.
 */
export const COOKIE_BANNER_SCROLL_PADDING = `calc(var(${COOKIE_BANNER_HEIGHT_VAR}, -16px) + 16px)`

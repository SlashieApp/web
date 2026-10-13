/**
 * Phone/tablet search chrome (FE-208): a logo band, then the search bar and
 * filter chips, floating over the map. The map controls and the top fade are
 * placed from the same numbers so they stay lined up.
 */
export const SEARCH_CHROME_TOP_PX = 12
export const SEARCH_LOGO_PX = 32
/** Logo plus py-2. */
export const SEARCH_LOGO_BAND_PX = SEARCH_LOGO_PX + 16
/** Search bar top edge, measured from the map's top. */
export const SEARCH_BAR_TOP_PX = SEARCH_CHROME_TOP_PX + SEARCH_LOGO_BAND_PX
/** Search bar, gap and filter chips. */
const SEARCH_BAR_AND_CHIPS_PX = 84
/** Mapbox gives each control corner a 10px margin. */
const MAPBOX_CTRL_MARGIN_PX = 10

/** Zoom controls (mouse devices) start level with the search bar. */
export const SEARCH_CTRL_TOP = `${SEARCH_BAR_TOP_PX - MAPBOX_CTRL_MARGIN_PX}px`
/** Touch phones: the compass sits under the search bar and chips. */
export const SEARCH_TOUCH_CTRL_TOP = `${SEARCH_BAR_TOP_PX + SEARCH_BAR_AND_CHIPS_PX}px`

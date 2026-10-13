/**
 * Tapping the logo on /search refreshes the task results instead of
 * navigating to the page you're already on. The header lives in `@ui` and
 * can't reach the search data, so it asks through this window event.
 */
export const SEARCH_REFRESH_EVENT = 'slashie:search-refresh'

export function requestSearchRefresh(): void {
  window.dispatchEvent(new Event(SEARCH_REFRESH_EVENT))
}

/** Listen for refresh requests; returns the unsubscribe. */
export function onSearchRefresh(listener: () => void): () => void {
  window.addEventListener(SEARCH_REFRESH_EVENT, listener)
  return () => window.removeEventListener(SEARCH_REFRESH_EVENT, listener)
}

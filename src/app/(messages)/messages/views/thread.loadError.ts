import type { ThreadViewConfig } from './types'

/** Network or server error with nothing cached: Try again or go back. */
export const threadLoadError: ThreadViewConfig = {
  layout: 'status',
  title: 'loadError',
  body: null,
  retry: true,
}

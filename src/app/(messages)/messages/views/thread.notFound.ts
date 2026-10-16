import type { ThreadViewConfig } from './types'

/** No access, removed, or a bad id: the API answers FORBIDDEN or nothing. */
export const threadNotFound: ThreadViewConfig = {
  layout: 'status',
  title: 'notFoundTitle',
  body: 'notFoundBody',
  retry: false,
}

import type { AboutViewConfig } from './types'

/** Has a session: straight to posting, or to tasks nearby (customers and workers alike). */
export const signedIn: AboutViewConfig = {
  primary: { label: 'postTask', href: '/tasks/create' },
  secondary: { label: 'browseTasks', href: '/search' },
}

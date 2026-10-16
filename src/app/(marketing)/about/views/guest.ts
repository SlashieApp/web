import type { AboutViewConfig } from './types'

/** Signed out: both ways in go through sign-up, then on to the page. */
export const guest: AboutViewConfig = {
  primary: {
    label: 'postTask',
    href: `/register?next=${encodeURIComponent('/tasks/create')}`,
  },
  secondary: {
    label: 'becomeWorker',
    href: `/register?next=${encodeURIComponent('/worker/setup')}`,
  },
}

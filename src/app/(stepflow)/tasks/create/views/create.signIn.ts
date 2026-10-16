import type { CreateTaskViewConfig } from './types'

/** Signed out: log in, then come back to this page (query kept). */
export const createSignIn: CreateTaskViewConfig = {
  layout: 'redirect',
  to: 'login',
}

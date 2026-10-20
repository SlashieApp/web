import type { AccountViewConfig } from './types'

/** Suspended: everything reads only (the API refuses changes); Log out still works. */
export const suspended: AccountViewConfig = {
  editable: false,
  passwordForm: null,
  showDelete: false,
}

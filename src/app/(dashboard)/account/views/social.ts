import type { AccountViewConfig } from './types'

/** Google or Apple only: no password row, and the email stays the provider's. */
export const social: AccountViewConfig = {
  editable: true,
  showPassword: false,
  showDelete: true,
}

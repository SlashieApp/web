import type { AccountViewConfig } from './types'

/** Google or Apple only: the Password row sets a first password. */
export const social: AccountViewConfig = {
  editable: true,
  passwordForm: 'set',
  showDelete: true,
}

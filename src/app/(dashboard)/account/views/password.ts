import type { AccountViewConfig } from './types'

/** Signs in with email and password (Google or Apple may be linked too). */
export const password: AccountViewConfig = {
  editable: true,
  passwordForm: 'change',
  showDelete: true,
}

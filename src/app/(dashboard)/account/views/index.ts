import { password } from './password'
import { social } from './social'
import { suspended } from './suspended'
import type { AccountView, AccountViewConfig } from './types'

export { getAccountView } from './getAccountView'
export type { AccountView, AccountViewConfig, AccountViewInput } from './types'

export const ACCOUNT_VIEWS: Record<AccountView, AccountViewConfig> = {
  password,
  social,
  suspended,
}

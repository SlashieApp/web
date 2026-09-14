import {
  clearAccountDisabled,
  getAccountDisabledFlag,
  markAccountDisabled,
  subscribeAccountDisabled,
} from '@/utils/accountDisabledState'
import {
  ACCOUNT_DISABLED_ERROR_CODE,
  isAccountDisabledError,
} from '@/utils/graphqlErrors'

export {
  ACCOUNT_DISABLED_ERROR_CODE,
  clearAccountDisabled,
  getAccountDisabledFlag,
  isAccountDisabledError,
  markAccountDisabled,
  subscribeAccountDisabled,
}

export const ACCOUNT_SUSPENDED_CONTACT_EMAIL = 'accounts@slashie.app' as const

type DisabledLike = { disabled?: boolean | null } | null | undefined

export function isMeAccountDisabled(me: DisabledLike) {
  return me?.disabled === true
}

export function syncAccountDisabledFromMe(me: DisabledLike) {
  if (isMeAccountDisabled(me)) {
    markAccountDisabled()
    return
  }
  if (me) clearAccountDisabled()
}

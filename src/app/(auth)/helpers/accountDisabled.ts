import { useSyncExternalStore } from 'react'

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

/** Suspended: `me.disabled`, or a request already failed with ACCOUNT_DISABLED. */
export function useAccountSuspended(me: DisabledLike): boolean {
  const flagged = useSyncExternalStore(
    subscribeAccountDisabled,
    getAccountDisabledFlag,
    () => false,
  )
  return flagged || isMeAccountDisabled(me)
}

export function syncAccountDisabledFromMe(me: DisabledLike) {
  if (isMeAccountDisabled(me)) {
    markAccountDisabled()
    return
  }
  if (me) clearAccountDisabled()
}

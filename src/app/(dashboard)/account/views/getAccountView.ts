import type { AccountView, AccountViewInput } from './types'

/** Picks the Account view; suspension wins over how the account signs in. */
export function getAccountView({
  suspended,
  hasPassword,
}: AccountViewInput): AccountView {
  if (suspended) return 'suspended'
  return hasPassword ? 'password' : 'social'
}

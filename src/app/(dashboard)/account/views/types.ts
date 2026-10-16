/** Who is looking at Account (README.md). */
export type AccountView = 'password' | 'social' | 'suspended'

export type AccountViewInput = {
  /** `me.disabled`, or a request already failed with ACCOUNT_DISABLED. */
  suspended: boolean
  /** The account has a password (`enabledLoginMethods` includes PASSWORD). */
  hasPassword: boolean
}

export type AccountViewConfig = {
  /** Rows have their buttons and switches; off while suspended. */
  editable: boolean
  /** The Password row (a new one by email); Google / Apple-only accounts have none. */
  showPassword: boolean
  /** The Delete account card; the API refuses it while suspended. */
  showDelete: boolean
}

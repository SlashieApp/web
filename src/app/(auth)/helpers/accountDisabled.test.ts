import { afterEach, describe, expect, it } from 'vitest'

import {
  ACCOUNT_DISABLED_ERROR_CODE,
  clearAccountDisabled,
  getAccountDisabledFlag,
  isAccountDisabledError,
  isMeAccountDisabled,
  markAccountDisabled,
  subscribeAccountDisabled,
  syncAccountDisabledFromMe,
} from './accountDisabled'

function gqlError(code: string): unknown {
  return {
    errors: [{ message: code, extensions: { code } }],
  }
}

afterEach(() => {
  clearAccountDisabled()
})

describe('isAccountDisabledError', () => {
  it('matches ACCOUNT_DISABLED by extensions.code', () => {
    expect(isAccountDisabledError(gqlError(ACCOUNT_DISABLED_ERROR_CODE))).toBe(
      true,
    )
    expect(isAccountDisabledError(gqlError('UNAUTHENTICATED'))).toBe(false)
  })
})

describe('isMeAccountDisabled', () => {
  it('is true only for disabled: true', () => {
    expect(isMeAccountDisabled({ disabled: true })).toBe(true)
    expect(isMeAccountDisabled({ disabled: false })).toBe(false)
    expect(isMeAccountDisabled(null)).toBe(false)
    expect(isMeAccountDisabled(undefined)).toBe(false)
  })
})

describe('account disabled session flag', () => {
  it('notifies subscribers when marked and cleared', () => {
    const seen: boolean[] = []
    const unsubscribe = subscribeAccountDisabled(() => {
      seen.push(getAccountDisabledFlag())
    })

    markAccountDisabled()
    markAccountDisabled()
    clearAccountDisabled()

    unsubscribe()
    expect(seen).toEqual([true, false])
  })

  it('syncs from me without clearing when me is missing', () => {
    markAccountDisabled()
    syncAccountDisabledFromMe(null)
    expect(getAccountDisabledFlag()).toBe(true)

    syncAccountDisabledFromMe({ disabled: false })
    expect(getAccountDisabledFlag()).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'

import { getLoginAutofill } from './loginAutofill'

describe('getLoginAutofill', () => {
  it('returns env values in development', () => {
    expect(
      getLoginAutofill({
        NODE_ENV: 'development',
        AUTOFILL_EMAIL: '  dev@example.com  ',
        AUTOFILL_PASSWORD: 'LocalPass!',
      }),
    ).toEqual({
      email: 'dev@example.com',
      password: 'LocalPass!',
    })
  })

  it('returns empty strings when env vars are unset', () => {
    expect(getLoginAutofill({ NODE_ENV: 'development' })).toEqual({
      email: '',
      password: '',
    })
  })

  it('ignores values outside development', () => {
    expect(
      getLoginAutofill({
        NODE_ENV: 'production',
        AUTOFILL_EMAIL: 'dev@example.com',
        AUTOFILL_PASSWORD: 'LocalPass!',
      }),
    ).toEqual({ email: '', password: '' })
  })
})

import { describe, expect, it } from 'vitest'

import { billingReturnUrl } from './billingUrls'

const origin = 'https://slashie.app'

describe('billingReturnUrl', () => {
  it('brings English visitors back to /billing with the Checkout result', () => {
    expect(billingReturnUrl(origin, 'en', 'success')).toBe(
      'https://slashie.app/billing?checkout=success',
    )
    expect(billingReturnUrl(origin, 'en', 'cancelled')).toBe(
      'https://slashie.app/billing?checkout=cancelled',
    )
  })

  it('keeps the Traditional Chinese prefix', () => {
    expect(billingReturnUrl(origin, 'zh-hk')).toBe(
      'https://slashie.app/zh-hk/billing',
    )
  })
})

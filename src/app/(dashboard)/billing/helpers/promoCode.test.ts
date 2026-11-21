import { PromoCodeDuration, PromoCodeProblem } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  type PromoCheck,
  normalizePromoCode,
  promoAppliedLine,
  promoCodeGives,
  promoProblemFromCheck,
  promoProblemFromError,
} from './promoCode'

/** FE-586 (BE-140; Ryan 21 Nov): what an applied code says, and why one can't be used. */
const en = bag.en.promo
const zh = bag.zh_hk.promo

const check = (fields: Partial<PromoCheck>): PromoCheck => ({
  code: 'LAUNCH50',
  valid: true,
  problem: null,
  percentOff: null,
  amountOff: null,
  currency: null,
  duration: PromoCodeDuration.Once,
  durationInMonths: null,
  startsAfterTrial: false,
  ...fields,
})

describe('what a code takes off, and for how long', () => {
  it('a percent: for some months, the first month, or every month', () => {
    const months = check({
      percentOff: 50,
      duration: PromoCodeDuration.Repeating,
      durationInMonths: 3,
    })
    expect(promoAppliedLine(months, en, 'en-GB')).toBe(
      'LAUNCH50: 50% off for 3 months',
    )
    expect(promoAppliedLine(months, zh, 'zh-HK')).toBe(
      'LAUNCH50：首 3 個月減 50%',
    )
    expect(
      promoCodeGives(
        check({ percentOff: 20, duration: PromoCodeDuration.Forever }),
        en,
        'en-GB',
      ),
    ).toBe('20% off every month')
    expect(
      promoCodeGives(
        check({ percentOff: 20, duration: PromoCodeDuration.Forever }),
        zh,
        'zh-HK',
      ),
    ).toBe('每月減 20%')
    expect(promoCodeGives(check({ percentOff: 12.5 }), en, 'en-GB')).toBe(
      '12.5% off your first month',
    )
  })

  it('a repeating code of one month reads as the first month', () => {
    expect(
      promoCodeGives(
        check({
          percentOff: 50,
          duration: PromoCodeDuration.Repeating,
          durationInMonths: 1,
        }),
        en,
        'en-GB',
      ),
    ).toBe('50% off your first month')
  })

  it('an amount, in pounds from pence', () => {
    expect(
      promoAppliedLine(
        check({ code: 'WELCOME5', amountOff: 500, currency: 'gbp' }),
        en,
        'en-GB',
      ),
    ).toBe('WELCOME5: £5 off your first month')
    expect(
      promoCodeGives(
        check({
          amountOff: 250,
          currency: 'gbp',
          duration: PromoCodeDuration.Repeating,
          durationInMonths: 2,
        }),
        en,
        'en-GB',
      ),
    ).toBe('£2.50 off for 2 months')
    expect(
      promoCodeGives(check({ amountOff: 500, currency: 'gbp' }), zh, 'zh-HK'),
    ).toBe('首月減 £5')
  })

  it('no discount in the check: the code alone', () => {
    expect(promoAppliedLine(check({}), en, 'en-GB')).toBe('LAUNCH50')
  })

  it('the code is trimmed; case is Stripe’s to ignore', () => {
    expect(normalizePromoCode('  launch50 ')).toBe('launch50')
  })
})

describe('why a code can’t be used', () => {
  it('reads the check’s reason; an unknown one as not found', () => {
    expect(
      promoProblemFromCheck(
        check({ valid: false, problem: PromoCodeProblem.Expired }),
      ),
    ).toBe('EXPIRED')
    expect(promoProblemFromCheck(check({ valid: false, problem: null }))).toBe(
      'NOT_FOUND',
    )
  })

  it('reads Checkout’s refusal and the rate limit; anything else is not about the code', () => {
    const gql = (extensions: Record<string, unknown>) => ({
      errors: [{ message: 'x', extensions }],
    })
    expect(
      promoProblemFromError(
        gql({ code: 'PROMO_CODE_INVALID', problem: 'USED_UP' }),
      ),
    ).toBe('USED_UP')
    expect(promoProblemFromError(gql({ code: 'PROMO_CODE_INVALID' }))).toBe(
      'NOT_FOUND',
    )
    expect(
      promoProblemFromError(gql({ code: 'PROMO_CODE_RATE_LIMITED' })),
    ).toBe('RATE_LIMITED')
    expect(
      promoProblemFromError(gql({ code: 'BILLING_NOT_CONFIGURED' })),
    ).toBeNull()
    expect(promoProblemFromError(new Error('offline'))).toBeNull()
  })

  it('every reason has words in both languages, and no long dashes', () => {
    expect(Object.keys(zh.problems).sort()).toEqual(
      Object.keys(en.problems).sort(),
    )
    expect(Object.keys(zh.gives).sort()).toEqual(Object.keys(en.gives).sort())
    expect(JSON.stringify([en, zh])).not.toMatch(/—/)
  })
})

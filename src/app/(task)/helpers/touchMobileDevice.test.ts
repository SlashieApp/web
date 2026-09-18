import { describe, expect, it } from 'vitest'

import { isPhoneUserAgent, isTouchMobileDeviceFrom } from './touchMobileDevice'

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
const IPAD =
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
const IPADOS_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
const ANDROID_PHONE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36'
const ANDROID_TABLET =
  'Mozilla/5.0 (Linux; Android 14; SM-X810) AppleWebKit/537.36 Safari/537.36'
const DESKTOP_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36'

describe('isPhoneUserAgent', () => {
  it('treats phones as mobile and tablets as not', () => {
    expect(isPhoneUserAgent(IPHONE, 5)).toBe(true)
    expect(isPhoneUserAgent(ANDROID_PHONE, 5)).toBe(true)
    expect(isPhoneUserAgent(IPAD, 5)).toBe(false)
    expect(isPhoneUserAgent(IPADOS_DESKTOP_UA, 5)).toBe(false)
    expect(isPhoneUserAgent(ANDROID_TABLET, 5)).toBe(false)
    expect(isPhoneUserAgent(DESKTOP_CHROME, 0)).toBe(false)
  })
})

describe('isTouchMobileDeviceFrom', () => {
  it('hides zoom only when the device is a phone and supports touch', () => {
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        userAgent: IPHONE,
        maxTouchPoints: 5,
      }),
    ).toBe(true)
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        userAgent: ANDROID_PHONE,
        maxTouchPoints: 5,
      }),
    ).toBe(true)
  })

  it('keeps zoom on tablets, desktops, and touch laptops', () => {
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        userAgent: IPAD,
        maxTouchPoints: 5,
      }),
    ).toBe(false)
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        userAgent: IPADOS_DESKTOP_UA,
        maxTouchPoints: 5,
      }),
    ).toBe(false)
    expect(
      isTouchMobileDeviceFrom({
        touch: false,
        userAgent: DESKTOP_CHROME,
        maxTouchPoints: 0,
      }),
    ).toBe(false)
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        userAgent: DESKTOP_CHROME,
        maxTouchPoints: 1,
      }),
    ).toBe(false)
  })

  it('trusts Client Hints mobile when present', () => {
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        uaDataMobile: true,
        userAgent: DESKTOP_CHROME,
        maxTouchPoints: 5,
      }),
    ).toBe(true)
    expect(
      isTouchMobileDeviceFrom({
        touch: true,
        uaDataMobile: false,
        userAgent: IPHONE,
        maxTouchPoints: 5,
      }),
    ).toBe(false)
  })
})

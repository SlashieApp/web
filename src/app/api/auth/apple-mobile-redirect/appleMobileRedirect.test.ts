import { describe, expect, it } from 'vitest'

import { MOBILE_OAUTH_CALLBACK } from '../mobile-redirect/mobileRedirect'
import {
  buildAppleMobileDeepLink,
  buildAppleMobileRedirectHtml,
} from './appleMobileRedirect'

const TOKEN = 'aaa.bbb.ccc'
const STATE = 'state_12345678'

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

function params(link: string) {
  expect(link.startsWith(`${MOBILE_OAUTH_CALLBACK}?`)).toBe(true)
  return new URL(link.replace(MOBILE_OAUTH_CALLBACK, 'https://x.test/'))
    .searchParams
}

describe('buildAppleMobileDeepLink', () => {
  it('forwards the token, state and first-time name', () => {
    const link = buildAppleMobileDeepLink(
      form({
        id_token: TOKEN,
        state: STATE,
        user: JSON.stringify({ name: { firstName: ' Sam ', lastName: 'Lee' } }),
      }),
    )
    const p = params(link)
    expect(p.get('provider')).toBe('apple')
    expect(p.get('id_token')).toBe(TOKEN)
    expect(p.get('state')).toBe(STATE)
    expect(p.get('first_name')).toBe('Sam')
    expect(p.get('last_name')).toBe('Lee')
  })

  it('passes a cancel through as an error', () => {
    const p = params(
      buildAppleMobileDeepLink(
        form({ error: 'user_cancelled_authorize', state: STATE }),
      ),
    )
    expect(p.get('error')).toBe('user_cancelled_authorize')
    expect(p.get('id_token')).toBeNull()
  })

  it('drops malformed values', () => {
    const p = params(
      buildAppleMobileDeepLink(
        form({ id_token: '<script>', state: 'x', user: 'not json' }),
      ),
    )
    expect(p.get('error')).toBe('invalid_response')
    expect(p.get('state')).toBeNull()
    expect(p.get('id_token')).toBeNull()
  })
})

describe('buildAppleMobileRedirectHtml', () => {
  it('opens only the given deep link, safely embedded', () => {
    const html = buildAppleMobileRedirectHtml(
      `${MOBILE_OAUTH_CALLBACK}?a=</script>`,
    )
    expect(html).not.toContain('</script>"')
    expect(html).toContain('\\u003c/script>')
    expect(html).toContain('href="slashie://oauth-callback?a=&lt;/script&gt;"')
  })
})

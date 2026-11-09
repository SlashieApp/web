import { describe, expect, it } from 'vitest'

import { taskServerError } from '@/app/(stepflow)/tasks/create/helpers/taskFieldError'

import bag from '../i11n.json'

/** How the API sends the refusal (BE-122): the code as the message and in `extensions.code`. */
const refused = {
  graphQLErrors: [
    {
      message: 'QUOTE_NOT_AVAILABLE',
      extensions: { code: 'QUOTE_NOT_AVAILABLE' },
    },
  ],
}

describe('a quote refused across a block (BE-122, FE-511)', () => {
  it('reads the neutral copy in both languages, word for word with the app', () => {
    expect(taskServerError(bag.en.serverErrors, refused, 'fallback')).toBe(
      "You can't send a quote on this task right now.",
    )
    expect(taskServerError(bag.zh_hk.serverErrors, refused, 'fallback')).toBe(
      '你目前未能為此任務報價。',
    )
  })

  it('never says who blocked whom, or that anyone did', () => {
    const copy = [
      bag.en.serverErrors.QUOTE_NOT_AVAILABLE,
      bag.zh_hk.serverErrors.QUOTE_NOT_AVAILABLE,
    ].join(' ')
    expect(copy).not.toMatch(/block/i)
    expect(copy).not.toMatch(/封鎖|屏蔽/)
  })
})

import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import { workerSetupErrorMessage } from './workerSetupErrors'

const apiError = (
  message: string,
  extensions: Record<string, unknown> = {},
) => ({
  errors: [{ message, extensions }],
})

describe('workerSetupErrorMessage', () => {
  it('reads the code from the message when the API throws a plain error', () => {
    expect(
      workerSetupErrorMessage(
        apiError('UNDERAGE', { code: 'INTERNAL_SERVER_ERROR' }),
        bag.en,
      ),
    ).toBe('You must be 18 or over to work on Slashie.')
  })

  it('uses a structured code, in the reader’s language', () => {
    expect(
      workerSetupErrorMessage(
        apiError('Not verified', { code: 'PHONE_NOT_VERIFIED' }),
        bag.zh_hk,
      ),
    ).toBe('繼續之前請驗證你的電話號碼。')
  })

  it('has copy in both languages for every coded setup check', () => {
    for (const code of [
      'TAGLINE_TOO_LONG',
      'BIO_TOO_LONG',
      'TOO_MANY_SKILLS',
      'INVALID_SKILL',
      'YEARS_EXPERIENCE_INVALID',
      'TOO_MANY_PORTFOLIO_URLS',
      'INVALID_PORTFOLIO_URL',
    ]) {
      const error = apiError(code, { code })
      expect(workerSetupErrorMessage(error, bag.en)).not.toBe(bag.en.saveFailed)
      expect(workerSetupErrorMessage(error, bag.zh_hk)).not.toBe(
        bag.zh_hk.saveFailed,
      )
    }
  })

  it('lists what an incomplete profile is missing', () => {
    expect(
      workerSetupErrorMessage(
        apiError('WORKER_PROFILE_INCOMPLETE', {
          code: 'WORKER_PROFILE_INCOMPLETE',
          missing: ['AVATAR', 'DATE_OF_BIRTH'],
        }),
        bag.en,
      ),
    ).toBe('Add a profile photo. Add your date of birth.')
  })

  it('falls back to a plain retry message', () => {
    expect(workerSetupErrorMessage(new Error('Failed to fetch'), bag.en)).toBe(
      "We couldn't save this step. Try again.",
    )
  })
})

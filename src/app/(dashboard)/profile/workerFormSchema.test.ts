import { describe, expect, it } from 'vitest'

import { storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'

import bag from './i11n.json'
import {
  createWorkerFormSchema,
  workerFormValuesFromMe,
} from './workerFormSchema'

const schema = createWorkerFormSchema(bag.en.workerForm.errors)
const values = workerFormValuesFromMe(storyWorkerMe())

const portfolioError = (portfolioUrls: string[]) => {
  const result = schema.safeParse({ ...values, portfolioUrls })
  return result.success
    ? null
    : result.error.flatten().fieldErrors.portfolioUrls?.[0]
}

describe('worker editor portfolio', () => {
  it('takes up to 12 entries', () => {
    expect(
      portfolioError(
        Array.from({ length: 12 }, (_, i) => `https://example.com/${i}.jpg`),
      ),
    ).toBeNull()
  })

  it('refuses a 13th', () => {
    expect(
      portfolioError(
        Array.from({ length: 13 }, (_, i) => `https://example.com/${i}.jpg`),
      ),
    ).toBe('Keep it to 12 photos.')
  })

  // The API's own rule for a saved entry. The form no longer takes links
  // (FE-548), so this only catches an old entry that can't be saved.
  it('refuses an entry that is not https or is over 2,048 characters', () => {
    const cannotSave =
      "One of your portfolio entries can't be saved. Remove it and try again."
    expect(portfolioError(['http://example.com/a.jpg'])).toBe(cannotSave)
    expect(portfolioError([`https://example.com/${'a'.repeat(2048)}`])).toBe(
      cannotSave,
    )
  })
})

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

describe('worker editor portfolio links', () => {
  it('takes up to 12 https links', () => {
    expect(
      portfolioError(
        Array.from({ length: 12 }, (_, i) => `https://example.com/${i}.jpg`),
      ),
    ).toBeNull()
  })

  it('refuses a 13th link', () => {
    expect(
      portfolioError(
        Array.from({ length: 13 }, (_, i) => `https://example.com/${i}.jpg`),
      ),
    ).toBe('Keep it to 12 portfolio links.')
  })

  it('refuses http and links over 2,048 characters', () => {
    expect(portfolioError(['http://example.com/a.jpg'])).toMatch(/https:\/\//)
    expect(portfolioError([`https://example.com/${'a'.repeat(2048)}`])).toMatch(
      /2048/,
    )
  })
})

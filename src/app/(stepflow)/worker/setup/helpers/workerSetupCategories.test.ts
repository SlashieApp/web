import { describe, expect, it } from 'vitest'

import { WorkerPrimaryCategory } from '@codegen/schema'

import bag from '../i11n.json'
import {
  WORKER_PRIMARY_CATEGORIES,
  categoryEnumFromSlug,
  categoryLabelFromEnum,
  categorySkills,
  categorySlugFromEnum,
  prefillHeadline,
  suggestedHeadline,
} from './workerSetupCategories'
import { emptyWorkerSetupFormState } from './workerSetupFormState'

const headline = (
  input: Partial<Parameters<typeof suggestedHeadline>[0]>,
  copy: typeof bag.en = bag.en,
) =>
  suggestedHeadline(
    {
      primaryCategory: 'plumbing',
      yearsExperience: '',
      locationName: '',
      ...input,
    },
    copy,
  )

describe('trades', () => {
  it('round-trips between the API enum and the slug', () => {
    expect(categoryEnumFromSlug('handyman')).toBe(
      WorkerPrimaryCategory.Handyman,
    )
    expect(
      categorySlugFromEnum(WorkerPrimaryCategory.MountingInstallation),
    ).toBe('mounting')
    expect(categorySlugFromEnum(null)).toBe('')
    expect(categoryEnumFromSlug('')).toBeUndefined()
  })

  it('has a name, a headline noun and skills in both languages for every trade', () => {
    for (const { slug } of WORKER_PRIMARY_CATEGORIES) {
      expect(bag.en.trades[slug].label).toBeTruthy()
      expect(bag.zh_hk.trades[slug].noun).toBeTruthy()
      expect(bag.zh_hk.trades[slug].skills).toHaveLength(
        bag.en.trades[slug].skills.length,
      )
    }
  })

  it('names the trade in the reader’s language', () => {
    expect(
      categoryLabelFromEnum(
        WorkerPrimaryCategory.MountingInstallation,
        bag.en.trades,
      ),
    ).toBe('Mounting & Installation')
    expect(
      categoryLabelFromEnum(WorkerPrimaryCategory.Plumbing, bag.zh_hk.trades),
    ).toBe('水喉')
    expect(categoryLabelFromEnum(null, bag.en.trades)).toBeNull()
  })

  it('suggests the trade’s skills, none before a trade is chosen', () => {
    expect(categorySkills('handyman', bag.en.trades)).toContain('TV Mounting')
    expect(categorySkills('', bag.en.trades)).toEqual([])
  })
})

describe('suggestedHeadline', () => {
  it('leads with years of experience', () => {
    expect(headline({ yearsExperience: '8', locationName: 'Watford' })).toBe(
      'Plumber with 8 years experience',
    )
    expect(headline({ yearsExperience: '1' })).toBe(
      'Plumber with 1 year experience',
    )
  })

  it('falls back to the town, never a street address', () => {
    expect(
      headline({
        locationName: '54 Herkomer Road, Bushey, WD23 3LU, United Kingdom',
      }),
    ).toBe('Plumber serving Bushey')
    expect(headline({ yearsExperience: '0' })).toBe('Plumber for local jobs')
  })

  it('writes Chinese headlines in Chinese word order', () => {
    expect(
      headline(
        { primaryCategory: 'handyman', yearsExperience: '8' },
        bag.zh_hk,
      ),
    ).toBe('8 年經驗的雜工師傅')
  })

  it('waits for a trade', () => {
    expect(headline({ primaryCategory: '', yearsExperience: '8' })).toBeNull()
  })
})

describe('prefillHeadline', () => {
  const chosen = {
    ...emptyWorkerSetupFormState(),
    primaryCategory: 'plumbing',
    yearsExperience: '8',
  }

  it('starts an empty headline from the suggestion', () => {
    expect(prefillHeadline(chosen, bag.en).tagline).toBe(
      'Plumber with 8 years experience',
    )
  })

  it('never replaces a headline the worker has', () => {
    expect(
      prefillHeadline({ ...chosen, tagline: 'Reliable local plumber' }, bag.en)
        .tagline,
    ).toBe('Reliable local plumber')
  })

  it('leaves it empty without a trade', () => {
    expect(prefillHeadline(emptyWorkerSetupFormState(), bag.en).tagline).toBe(
      '',
    )
  })
})

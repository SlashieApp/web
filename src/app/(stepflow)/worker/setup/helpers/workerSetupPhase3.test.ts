import { describe, expect, it } from 'vitest'

import { WorkerPrimaryCategory } from '@codegen/schema'

import { computeProfileStrength } from './workerProfileStrength'
import {
  canReplaceHeadline,
  categoryEnumFromSlug,
  categorySlugFromEnum,
  suggestedHeadline,
} from './workerSetupCategories'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from './workerSetupFormState'
import { addQualifications } from './workerSetupQualifications'
import { buildSavePayload } from './workerSetupValidation'

function form(patch: Partial<WorkerSetupFormState>): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

describe('category enum ↔ slug mapping', () => {
  it('round-trips every category', () => {
    expect(categoryEnumFromSlug('handyman')).toBe(
      WorkerPrimaryCategory.Handyman,
    )
    expect(
      categorySlugFromEnum(WorkerPrimaryCategory.MountingInstallation),
    ).toBe('mounting')
    expect(categorySlugFromEnum(WorkerPrimaryCategory.DeliveryErrands)).toBe(
      'delivery',
    )
    expect(categorySlugFromEnum(null)).toBe('')
    expect(categoryEnumFromSlug('')).toBeUndefined()
  })

  it('buildSavePayload sends the enum plus plain skills', () => {
    expect(
      buildSavePayload(
        'services.skills',
        form({ primaryCategory: 'plumbing', skills: ['Tap Repairs'] }),
      ),
    ).toEqual({
      primaryCategory: WorkerPrimaryCategory.Plumbing,
      skills: ['Tap Repairs'],
    })
  })

  it('buildSavePayload sends qualifications with experience', () => {
    expect(
      buildSavePayload(
        'services.experience',
        form({ yearsExperience: '8', qualifications: ['Gas Safe'] }),
      ),
    ).toEqual({ yearsExperience: 8, qualifications: ['Gas Safe'] })
  })
})

describe('addQualifications', () => {
  it('dedupes case-insensitively, preserves typed capitalisation, caps at 10', () => {
    expect(addQualifications(['Gas Safe'], 'gas safe, NICEIC')).toEqual([
      'Gas Safe',
      'NICEIC',
    ])
    const full = Array.from({ length: 10 }, (_, i) => `Qual ${i}`)
    expect(addQualifications(full, 'One More')).toHaveLength(10)
  })

  it('rejects labels outside 2–40 chars', () => {
    expect(addQualifications([], 'x')).toEqual([])
    expect(addQualifications([], 'q'.repeat(41))).toEqual([])
  })
})

describe('suggestedHeadline', () => {
  it('prefers years of experience', () => {
    expect(
      suggestedHeadline({
        primaryCategory: 'handyman',
        yearsExperience: '8',
        locationName: 'Watford',
      }),
    ).toBe('Handyman with 8 years experience')
  })

  it('pluralises correctly for one year', () => {
    expect(
      suggestedHeadline({
        primaryCategory: 'plumbing',
        yearsExperience: '1',
        locationName: '',
      }),
    ).toBe('Plumber with 1 year experience')
  })

  it('falls back to the service area, then a generic line', () => {
    expect(
      suggestedHeadline({
        primaryCategory: 'plumbing',
        yearsExperience: '',
        locationName: 'Watford',
      }),
    ).toBe('Plumber serving Watford')
    expect(
      suggestedHeadline({
        primaryCategory: 'plumbing',
        yearsExperience: '0',
        locationName: '',
      }),
    ).toBe('Plumber for local jobs')
  })

  it('returns null without a category', () => {
    expect(
      suggestedHeadline({
        primaryCategory: '',
        yearsExperience: '8',
        locationName: 'Watford',
      }),
    ).toBeNull()
  })
})

describe('canReplaceHeadline', () => {
  it('replaces empty and previously auto-composed headlines', () => {
    expect(canReplaceHeadline('')).toBe(true)
    expect(canReplaceHeadline('Handyman with 8 years experience')).toBe(true)
    expect(canReplaceHeadline('Plumber serving Watford')).toBe(true)
  })

  it('never replaces a headline the worker typed', () => {
    expect(canReplaceHeadline('Reliable local help across North London')).toBe(
      false,
    )
  })
})

describe('computeProfileStrength', () => {
  const completeForm = form({
    tagline: 'Handyman with 8 years experience',
    bio: 'I fit and repair kitchens across North London. Customers choose me for tidy work and honest quotes with no surprises.',
    primaryCategory: 'handyman',
    skills: ['TV Mounting', 'Shelving', 'Flat-pack'],
    locationName: 'Camden',
    portfolioUrls: ['https://example.com/job.jpg'],
  })

  it('scores an empty profile as Starter with every fix-it link', () => {
    const strength = computeProfileStrength({
      form: form({}),
      avatarUrl: null,
      phoneVerified: false,
    })
    expect(strength.tier).toBe('starter')
    expect(strength.doneCount).toBe(0)
    expect(strength.items.every((item) => !item.done)).toBe(true)
  })

  it('scores a complete profile as All-star', () => {
    const strength = computeProfileStrength({
      form: completeForm,
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    })
    expect(strength.tier).toBe('allStar')
    expect(strength.doneCount).toBe(7)
    expect(strength.percent).toBe(100)
  })

  it('scores the middle band as Good and links the missing steps', () => {
    const strength = computeProfileStrength({
      form: { ...completeForm, portfolioUrls: [], bio: 'short bio' },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: false,
    })
    expect(strength.tier).toBe('good')
    const missingSteps = strength.items
      .filter((item) => !item.done)
      .map((item) => item.subStep)
    expect(missingSteps).toEqual([
      'profile.bio',
      'verify.phone',
      'verify.portfolio',
    ])
  })
})

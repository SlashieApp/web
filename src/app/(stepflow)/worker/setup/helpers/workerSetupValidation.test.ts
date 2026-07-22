import { describe, expect, it } from 'vitest'

import type { MeWorkerSetupQuery } from '@codegen/schema'

import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from './workerSetupFormState'
import {
  SKILLS_MAX,
  addSkills,
  normalizeSkillLabel,
  removeSkill,
} from './workerSetupSkills'
import {
  buildSavePayload,
  isJunkBio,
  validateWorkerSetupSubStep,
} from './workerSetupValidation'

/** `me` is only read by the verify sub-step; other cases never touch it. */
const meStub = {} as MeWorkerSetupQuery['me']

const GOOD_BIO =
  'I fit and repair kitchens across North London. Customers choose me for tidy, ' +
  'reliable work and clear quotes with no surprises on the day.'

const GOOD_HEADLINE = 'Handyman with 8 years experience'

function form(patch: Partial<WorkerSetupFormState>): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

describe('isJunkBio', () => {
  it('rejects a single repeated character even at length', () => {
    expect(isJunkBio('o'.repeat(120))).toBe(true)
  })

  it('rejects a single long word', () => {
    expect(isJunkBio('plumbingplumbingplumbing')).toBe(true)
  })

  it('accepts a real sentence (10+ distinct characters)', () => {
    expect(isJunkBio(GOOD_BIO)).toBe(false)
  })

  it('accepts 12+ words even with a narrow alphabet', () => {
    expect(isJunkBio('a be do go an on it at is as no so up')).toBe(false)
  })
})

describe('validateWorkerSetupSubStep — profile.bio', () => {
  it('rejects the 1-char junk bio that live MVP accepted', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({ bio: 'o', tagline: GOOD_HEADLINE }),
      meStub,
    )
    expect(errors.bio).toMatch(/80 characters/)
  })

  it('rejects an 80+ char junk bio via the content heuristic', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      // 120 chars, clears the length floor, but 1 distinct char / 1 word.
      form({ bio: 'o'.repeat(120), tagline: GOOD_HEADLINE }),
      meStub,
    )
    expect(errors.bio).toMatch(/full sentences/)
  })

  it('rejects a bio over 300 characters', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({
        bio: `${GOOD_BIO} ${'More detail. '.repeat(20)}`,
        tagline: GOOD_HEADLINE,
      }),
      meStub,
    )
    expect(errors.bio).toMatch(/300/)
  })

  it('accepts a real bio with a valid headline', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({ bio: GOOD_BIO, tagline: GOOD_HEADLINE }),
      meStub,
    )
    expect(errors).toEqual({})
  })
})

describe('validateWorkerSetupSubStep — headline (tagline)', () => {
  it('requires a headline', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({ bio: GOOD_BIO, tagline: '' }),
      meStub,
    )
    expect(errors.tagline).toBeTruthy()
  })

  it('rejects a single word even when long enough', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({ bio: GOOD_BIO, tagline: 'Electrician' }),
      meStub,
    )
    expect(errors.tagline).toMatch(/few words/)
  })

  it('rejects under 10 characters', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({ bio: GOOD_BIO, tagline: 'Top pro' }),
      meStub,
    )
    expect(errors.tagline).toMatch(/10/)
  })

  it('rejects over 80 characters', () => {
    const errors = validateWorkerSetupSubStep(
      'profile.bio',
      form({
        bio: GOOD_BIO,
        tagline: `Handyman ${'and decorator '.repeat(7)}`,
      }),
      meStub,
    )
    expect(errors.tagline).toMatch(/80/)
  })
})

describe('validateWorkerSetupSubStep — services.skills', () => {
  it('rejects fewer than 3 skills (the "test" single-skill case)', () => {
    const errors = validateWorkerSetupSubStep(
      'services.skills',
      form({ skills: ['Test'] }),
      meStub,
    )
    expect(errors.skills).toMatch(/at least 3/)
  })

  it('accepts a category plus exactly 3 skills', () => {
    const errors = validateWorkerSetupSubStep(
      'services.skills',
      form({
        primaryCategory: 'handyman',
        skills: ['Painting', 'Tiling', 'Shelving'],
      }),
      meStub,
    )
    expect(errors).toEqual({})
  })

  it('requires a primary category', () => {
    const errors = validateWorkerSetupSubStep(
      'services.skills',
      form({ skills: ['Painting', 'Tiling', 'Shelving'] }),
      meStub,
    )
    expect(errors.primaryCategory).toMatch(/kind of work/)
  })

  it('rejects more than 12 skills', () => {
    const errors = validateWorkerSetupSubStep(
      'services.skills',
      form({ skills: Array.from({ length: 13 }, (_, i) => `Skill ${i}`) }),
      meStub,
    )
    expect(errors.skills).toMatch(/12/)
  })
})

describe('validateWorkerSetupSubStep — services.experience', () => {
  it.each(['-1', '61', '2.5', 'abc'])('rejects %s', (value) => {
    const errors = validateWorkerSetupSubStep(
      'services.experience',
      form({ yearsExperience: value }),
      meStub,
    )
    expect(errors.yearsExperience).toBeTruthy()
  })

  it.each(['0', '8', '60'])('accepts %s', (value) => {
    const errors = validateWorkerSetupSubStep(
      'services.experience',
      form({ yearsExperience: value }),
      meStub,
    )
    expect(errors).toEqual({})
  })
})

describe('validateWorkerSetupSubStep — verify.phone (BE requires phone)', () => {
  const emailOnlyMe = {
    emailVerified: true,
    phoneVerified: false,
  } as MeWorkerSetupQuery['me']
  const phoneVerifiedMe = {
    emailVerified: false,
    phoneVerified: true,
  } as MeWorkerSetupQuery['me']

  it('rejects an email-only account (BE finalize throws PHONE_NOT_VERIFIED)', () => {
    const errors = validateWorkerSetupSubStep(
      'verify.phone',
      form({}),
      emailOnlyMe,
    )
    expect(errors.contact).toMatch(/phone/i)
  })

  it('passes with a verified phone', () => {
    const errors = validateWorkerSetupSubStep(
      'verify.phone',
      form({}),
      phoneVerifiedMe,
    )
    expect(errors).toEqual({})
  })
})

describe('skills chips helpers', () => {
  it('title-cases and preserves existing capitals', () => {
    expect(normalizeSkillLabel('  tv   mounting ')).toBe('Tv Mounting')
    expect(normalizeSkillLabel('TV mounting')).toBe('TV Mounting')
  })

  it('rejects labels outside 2–30 chars', () => {
    expect(normalizeSkillLabel('x')).toBeNull()
    expect(normalizeSkillLabel('a'.repeat(31))).toBeNull()
  })

  it('splits pasted lists, dedupes case-insensitively, and caps at 12', () => {
    expect(addSkills(['Painting'], 'painting, tiling; shelving')).toEqual([
      'Painting',
      'Tiling',
      'Shelving',
    ])
    const full = Array.from({ length: SKILLS_MAX }, (_, i) => `Skill ${i}`)
    expect(addSkills(full, 'One More')).toHaveLength(SKILLS_MAX)
  })

  it('removes a chip', () => {
    expect(removeSkill(['Painting', 'Tiling'], 'Painting')).toEqual(['Tiling'])
  })
})

describe('buildSavePayload — wire format unchanged', () => {
  it('sends skills as a plain string array', () => {
    expect(
      buildSavePayload(
        'services.skills',
        form({ skills: ['Painting', 'Tiling', 'Shelving'] }),
      ),
    ).toEqual({ skills: ['Painting', 'Tiling', 'Shelving'] })
  })

  it('saves the headline to the existing tagline field', () => {
    expect(
      buildSavePayload(
        'profile.bio',
        form({ bio: GOOD_BIO, tagline: GOOD_HEADLINE }),
      ),
    ).toEqual({ tagline: GOOD_HEADLINE, bio: GOOD_BIO })
  })
})

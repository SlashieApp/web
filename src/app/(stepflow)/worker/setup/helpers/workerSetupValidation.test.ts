import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from './workerSetupFormState'
import {
  type WorkerSetupAccount,
  buildSavePayload,
  isJunkBio,
  textWeight,
  validateWorkerSetupScreen,
  wordCount,
  workerSetupErrorText,
} from './workerSetupValidation'

const GOOD_BIO =
  'I fit and repair kitchens across North London. Customers choose me for tidy, ' +
  'reliable work and clear quotes with no surprises on the day.'
const GOOD_HEADLINE = 'Handyman with 8 years experience'
const READY = { avatarUrl: 'https://example.com/me.jpg', phoneVerified: true }

function form(patch: Partial<WorkerSetupFormState>): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

const about = (
  patch: Partial<WorkerSetupFormState>,
  account: WorkerSetupAccount = READY,
) =>
  validateWorkerSetupScreen(
    'about',
    form({ firstName: 'Sam', lastName: 'Taylor', ...patch }),
    account,
  )

const profile = (patch: Partial<WorkerSetupFormState>) =>
  validateWorkerSetupScreen(
    'profile',
    form({ tagline: GOOD_HEADLINE, bio: GOOD_BIO, ...patch }),
    READY,
  )

describe('About you', () => {
  it('needs a first and last name', () => {
    expect(
      validateWorkerSetupScreen(
        'about',
        form({ dateOfBirth: '1990-01-01' }),
        READY,
      ),
    ).toEqual({ firstName: 'firstNameRequired', lastName: 'lastNameRequired' })
  })

  it('asks for a date of birth', () => {
    expect(about({}).dateOfBirth).toBe('dateOfBirthRequired')
  })

  it('turns away a date in the future or too long ago', () => {
    expect(about({ dateOfBirth: '2999-01-01' }).dateOfBirth).toBe(
      'dateOfBirthInvalid',
    )
    expect(about({ dateOfBirth: '1850-01-01' }).dateOfBirth).toBe(
      'dateOfBirthInvalid',
    )
  })

  it('turns away anyone under 18', () => {
    expect(about({ dateOfBirth: '2015-01-01' }).dateOfBirth).toBe('underage')
  })

  it('needs a profile photo', () => {
    expect(
      about({ dateOfBirth: '1990-01-01' }, { ...READY, avatarUrl: null })
        .avatar,
    ).toBe('photoRequired')
  })

  it('passes an adult with a name and a photo', () => {
    expect(about({ dateOfBirth: '1990-01-01' })).toEqual({})
  })
})

describe('Your work', () => {
  const work = (patch: Partial<WorkerSetupFormState>) =>
    validateWorkerSetupScreen(
      'work',
      form({
        primaryCategory: 'handyman',
        skills: ['Painting', 'Tiling', 'Shelving'],
        yearsExperience: '8',
        ...patch,
      }),
      READY,
    )

  it('needs the main trade', () => {
    expect(work({ primaryCategory: '' }).primaryCategory).toBe('tradeRequired')
  })

  it('needs 3 to 12 skills', () => {
    expect(work({ skills: ['Test'] }).skills).toBe('skillsTooFew')
    expect(
      work({ skills: Array.from({ length: 13 }, (_, i) => `Skill ${i}`) })
        .skills,
    ).toBe('skillsTooMany')
  })

  it.each(['', '-1', '61', '2.5', 'abc'])('turns away %j years', (value) => {
    expect(work({ yearsExperience: value }).yearsExperience).toBeTruthy()
  })

  it.each(['0', '8', '60'])('accepts %s years', (value) => {
    expect(work({ yearsExperience: value })).toEqual({})
  })
})

describe('Your profile', () => {
  it('passes a real headline and bio', () => {
    expect(profile({})).toEqual({})
  })

  it('needs a headline of a few words', () => {
    expect(profile({ tagline: '' }).tagline).toBe('headlineTooShort')
    expect(profile({ tagline: 'Electrician' }).tagline).toBe('headlineOneWord')
    expect(
      profile({ tagline: `Handyman ${'and decorator '.repeat(7)}` }).tagline,
    ).toBe('headlineTooLong')
  })

  it('accepts a Chinese headline, which has no spaces', () => {
    expect(profile({ tagline: '專業水喉師傅' })).toEqual({})
  })

  it('turns away a bio that is too short, too long or placeholder text', () => {
    expect(profile({ bio: 'o' }).bio).toBe('bioTooShort')
    expect(profile({ bio: 'o'.repeat(120) }).bio).toBe('bioJunk')
    expect(
      profile({ bio: `${GOOD_BIO} ${'More detail. '.repeat(20)}` }).bio,
    ).toBe('bioTooLong')
  })

  it('accepts a Chinese bio of about half the characters', () => {
    expect(
      profile({
        bio: '我在北倫敦安裝和維修廚房及浴室，已有八年經驗。顧客選擇我，是因為我做事整齊、報價誠實，而且準時到達。',
      }),
    ).toEqual({})
  })

  it('never needs the optional work photos', () => {
    expect(profile({ portfolioUrls: [] })).toEqual({})
  })
})

describe('Where you work and phone', () => {
  it('needs a town or postcode, but not a travel distance', () => {
    expect(validateWorkerSetupScreen('area', form({}), READY)).toEqual({
      locationName: 'areaRequired',
    })
    expect(
      validateWorkerSetupScreen(
        'area',
        form({ locationName: 'Watford' }),
        READY,
      ),
    ).toEqual({})
  })

  it('needs a verified phone; a verified email alone is not enough', () => {
    expect(
      validateWorkerSetupScreen('phone', form({}), {
        ...READY,
        phoneVerified: false,
      }),
    ).toEqual({ contact: 'phoneRequired' })
    expect(validateWorkerSetupScreen('phone', form({}), READY)).toEqual({})
  })
})

describe('text measures', () => {
  it('counts each Chinese character as a word, and twice for length', () => {
    expect(wordCount('專業水喉師傅')).toBe(6)
    expect(wordCount('Handyman with 8 years')).toBe(4)
    expect(textWeight('水喉')).toBe(4)
    expect(textWeight('tap')).toBe(3)
  })

  it('spots placeholder bios', () => {
    expect(isJunkBio('o'.repeat(120))).toBe(true)
    expect(isJunkBio('好'.repeat(60))).toBe(true)
    expect(isJunkBio('plumbingplumbingplumbing')).toBe(true)
    expect(isJunkBio(GOOD_BIO)).toBe(false)
    expect(isJunkBio('a be do go an on it at is as no so up')).toBe(false)
  })
})

describe('workerSetupErrorText', () => {
  it('fills in the limits', () => {
    expect(workerSetupErrorText(bag.en.errors, 'skillsTooFew')).toBe(
      'Add at least 3 skills so customers can find you for the right tasks.',
    )
    expect(workerSetupErrorText(bag.zh_hk.errors, 'bioTooLong')).toBe(
      '簡介請少於 300 個字元。',
    )
    expect(workerSetupErrorText(bag.en.errors, undefined)).toBeUndefined()
  })
})

describe('buildSavePayload', () => {
  it('saves the headline to the tagline field', () => {
    expect(
      buildSavePayload(
        'profile.bio',
        form({ bio: ` ${GOOD_BIO} `, tagline: GOOD_HEADLINE }),
      ),
    ).toEqual({ tagline: GOOD_HEADLINE, bio: GOOD_BIO })
  })

  it('sends the date of birth with the name', () => {
    expect(
      buildSavePayload(
        'profile.details',
        form({
          firstName: ' Sam ',
          lastName: 'Taylor',
          dateOfBirth: '1990-04-12',
        }),
      ),
    ).toEqual({
      firstName: 'Sam',
      lastName: 'Taylor',
      dateOfBirth: '1990-04-12T00:00:00.000Z',
    })
  })

  it('sends no photo: finalizeAvatarUpload already saved it', () => {
    expect(buildSavePayload('profile.photo', form({}))).toEqual({})
  })

  it('sends the travel distance as a number, or nothing', () => {
    expect(
      buildSavePayload('area.travel', form({ travelRadiusMiles: '10' })),
    ).toEqual({ travelRadiusMiles: 10 })
    expect(buildSavePayload('area.travel', form({}))).toEqual({
      travelRadiusMiles: undefined,
    })
  })
})

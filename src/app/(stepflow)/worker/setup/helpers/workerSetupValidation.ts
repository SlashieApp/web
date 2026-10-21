import { z } from 'zod'

import { formatMessage } from '@/i18n/loadPageI11n'
import { ageFromIsoDateOnly } from '@/utils/age'

import type bag from '../i11n.json'
import {
  type WorkerSetupScreenId,
  type WorkerSetupSubStepId,
  workerSetupScreen,
} from '../views'
import { categoryEnumFromSlug } from './workerSetupCategories'
import type { WorkerSetupFormState } from './workerSetupFormState'
import { SKILLS_MAX, SKILLS_MIN } from './workerSetupSkills'

export const BIO_MIN_CHARS = 80
export const BIO_MAX_CHARS = 300
export const HEADLINE_MIN_CHARS = 10
export const HEADLINE_MAX_CHARS = 80
export const YEARS_EXPERIENCE_MAX = 60
const AGE_MIN = 18
const AGE_MAX = 120

/** Validation errors are keys of the setup bag's `errors` group. */
export type WorkerSetupErrorKey = keyof (typeof bag)['en']['errors']
export type WorkerSetupFieldErrors = Partial<
  Record<string, WorkerSetupErrorKey>
>

/** What the account already has (the photo is uploaded, the phone verified elsewhere). */
export type WorkerSetupAccount = {
  avatarUrl?: string | null
  phoneVerified?: boolean | null
}

const CJK = /[⺀-鿿가-힯豈-﫿]/g

/** Length with Chinese, Japanese and Korean characters counted twice: each says about as much as two letters. */
export function textWeight(text: string): number {
  return text.length + (text.match(CJK)?.length ?? 0)
}

/** Words, counting each CJK character as one, since those aren't spaced. */
export function wordCount(text: string): number {
  const cjk = text.match(CJK)?.length ?? 0
  return cjk + text.replace(CJK, ' ').split(/\s+/).filter(Boolean).length
}

/**
 * Junk-content floor for the bio: passes with at least 10 distinct characters
 * OR at least 12 words. Catches "oooooo…" and single-word walls that clear the
 * length minimum without saying anything.
 */
export function isJunkBio(bio: string): boolean {
  const distinctChars = new Set(bio.replace(/\s+/g, '').toLowerCase()).size
  const words = bio.split(/\s+/).filter(Boolean).length
  return distinctChars < 10 && words < 12
}

function isRealAge(value: string): boolean {
  const age = ageFromIsoDateOnly(value)
  return age !== null && age >= 0 && age <= AGE_MAX
}

/** Rules per API sub-step; the first problem with each field wins. */
const SCHEMAS: Partial<Record<WorkerSetupSubStepId, z.ZodType>> = {
  'profile.details': z.object({
    firstName: z.string().trim().min(1, 'firstNameRequired'),
    lastName: z.string().trim().min(1, 'lastNameRequired'),
  }),
  'profile.photo': z.object({
    dateOfBirth: z
      .string()
      .trim()
      .min(1, 'dateOfBirthRequired')
      .refine(isRealAge, 'dateOfBirthInvalid')
      .refine((v) => (ageFromIsoDateOnly(v) ?? 0) >= AGE_MIN, 'underage'),
  }),
  'profile.bio': z.object({
    tagline: z
      .string()
      .trim()
      .refine((v) => textWeight(v) >= HEADLINE_MIN_CHARS, 'headlineTooShort')
      .max(HEADLINE_MAX_CHARS, 'headlineTooLong')
      .refine((v) => wordCount(v) >= 2, 'headlineOneWord'),
    bio: z
      .string()
      .trim()
      .refine((v) => textWeight(v) >= BIO_MIN_CHARS, 'bioTooShort')
      .max(BIO_MAX_CHARS, 'bioTooLong')
      .refine((v) => !isJunkBio(v), 'bioJunk'),
  }),
  'services.skills': z.object({
    primaryCategory: z.string().min(1, 'tradeRequired'),
    skills: z
      .array(z.string())
      .min(SKILLS_MIN, 'skillsTooFew')
      .max(SKILLS_MAX, 'skillsTooMany'),
  }),
  'services.experience': z.object({
    yearsExperience: z
      .string()
      .trim()
      .min(1, 'yearsRequired')
      .refine((v) => {
        const n = Number(v)
        return Number.isInteger(n) && n >= 0 && n <= YEARS_EXPERIENCE_MAX
      }, 'yearsInvalid'),
  }),
  'area.location': z.object({
    locationName: z.string().trim().min(1, 'areaRequired'),
  }),
}

/** Problems that stop the worker leaving a screen, by field. */
export function validateWorkerSetupScreen(
  screen: WorkerSetupScreenId,
  form: WorkerSetupFormState,
  account: WorkerSetupAccount,
): WorkerSetupFieldErrors {
  const errors: WorkerSetupFieldErrors = {}
  for (const step of workerSetupScreen(screen).subSteps) {
    const result = SCHEMAS[step]?.safeParse(form)
    for (const issue of result?.error?.issues ?? []) {
      const field = issue.path[0]
      if (typeof field === 'string' && !(field in errors)) {
        errors[field] = issue.message as WorkerSetupErrorKey
      }
    }
    if (step === 'profile.photo' && !account.avatarUrl?.trim()) {
      errors.avatar = 'photoRequired'
    }
    // The API finishes setup only with a verified phone, not an email.
    if (step === 'verify.phone' && !account.phoneVerified) {
      errors.contact = 'phoneRequired'
    }
  }
  return errors
}

const ERROR_VARS = {
  bioMin: BIO_MIN_CHARS,
  bioMax: BIO_MAX_CHARS,
  headlineMin: HEADLINE_MIN_CHARS,
  headlineMax: HEADLINE_MAX_CHARS,
  skillsMin: SKILLS_MIN,
  skillsMax: SKILLS_MAX,
  yearsMax: YEARS_EXPERIENCE_MAX,
}

/** An error key in the reader's language, with its limits filled in. */
export function workerSetupErrorText(
  copy: Record<WorkerSetupErrorKey, string>,
  key: WorkerSetupErrorKey | undefined,
): string | undefined {
  return key ? formatMessage(copy[key], ERROR_VARS) : undefined
}

export function buildSavePayload(
  subStepId: WorkerSetupSubStepId,
  form: WorkerSetupFormState,
): Record<string, unknown> {
  switch (subStepId) {
    case 'profile.details':
      return {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth:
          form.dateOfBirth.trim() === ''
            ? undefined
            : new Date(
                `${form.dateOfBirth.trim()}T00:00:00.000Z`,
              ).toISOString(),
      }
    case 'profile.photo':
      // `finalizeAvatarUpload` saved the photo; the API only checks it is set.
      return {}
    case 'profile.bio':
      return {
        tagline: form.tagline.trim(),
        bio: form.bio.trim(),
      }
    case 'services.skills':
      return {
        primaryCategory: categoryEnumFromSlug(form.primaryCategory),
        skills: form.skills,
      }
    case 'services.experience':
      return {
        yearsExperience: Number.parseInt(form.yearsExperience.trim(), 10),
        qualifications: form.qualifications,
      }
    case 'area.location': {
      const label = form.locationName.trim()
      const placed =
        form.locationLat != null &&
        form.locationLng != null &&
        Number.isFinite(form.locationLat) &&
        Number.isFinite(form.locationLng)
      return {
        location: {
          name: label,
          address: label,
          lat: placed ? form.locationLat : null,
          lng: placed ? form.locationLng : null,
        },
      }
    }
    case 'area.travel': {
      const raw = form.travelRadiusMiles.trim()
      return {
        travelRadiusMiles: raw === '' ? undefined : Number.parseFloat(raw),
      }
    }
    case 'verify.portfolio':
      return { portfolioUrls: form.portfolioUrls }
    default:
      return {}
  }
}

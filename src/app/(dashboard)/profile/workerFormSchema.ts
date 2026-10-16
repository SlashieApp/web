import { z } from 'zod'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { categorySlugFromEnum } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { QUALIFICATIONS_MAX } from '@/app/(stepflow)/worker/setup/helpers/workerSetupQualifications'
import {
  SKILLS_MAX,
  SKILLS_MIN,
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupSkills'
import {
  BIO_MAX_CHARS,
  BIO_MIN_CHARS,
  HEADLINE_MAX_CHARS,
  HEADLINE_MIN_CHARS,
  YEARS_EXPERIENCE_MAX,
  isJunkBio,
  textWeight,
  wordCount,
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'
import { formatMessage } from '@/i18n/loadPageI11n'

export type WorkerFormErrors = {
  legalName: string
  headlineShort: string
  headlineLong: string
  headlineWords: string
  bioShort: string
  bioLong: string
  bioJunk: string
  category: string
  skillsFew: string
  skillsMany: string
  qualificationsMany: string
  yearsMissing: string
  yearsRange: string
  area: string
  radius: string
}

/**
 * Mirrors the setup-flow validation floor (no junk via the dashboard editor),
 * with errors in the page's language.
 */
export function createWorkerFormSchema(errors: WorkerFormErrors) {
  const count = (message: string, value: number) =>
    formatMessage(message, { count: value })
  return z.object({
    legalName: z.string().trim().min(1, errors.legalName),
    tagline: z
      .string()
      .trim()
      // Chinese counts by weight and per character, as in setup.
      .refine(
        (v) => textWeight(v) >= HEADLINE_MIN_CHARS,
        count(errors.headlineShort, HEADLINE_MIN_CHARS),
      )
      .max(HEADLINE_MAX_CHARS, count(errors.headlineLong, HEADLINE_MAX_CHARS))
      .refine((v) => wordCount(v) >= 2, errors.headlineWords),
    bio: z
      .string()
      .trim()
      .refine(
        (v) => textWeight(v) >= BIO_MIN_CHARS,
        count(errors.bioShort, BIO_MIN_CHARS),
      )
      .max(BIO_MAX_CHARS, count(errors.bioLong, BIO_MAX_CHARS))
      .refine((v) => !isJunkBio(v), errors.bioJunk),
    primaryCategory: z.string().min(1, errors.category),
    skills: z
      .array(z.string())
      .min(SKILLS_MIN, count(errors.skillsFew, SKILLS_MIN))
      .max(SKILLS_MAX, count(errors.skillsMany, SKILLS_MAX)),
    qualifications: z
      .array(z.string())
      .max(
        QUALIFICATIONS_MAX,
        count(errors.qualificationsMany, QUALIFICATIONS_MAX),
      ),
    yearsExperience: z
      .string()
      .trim()
      .min(1, errors.yearsMissing)
      .refine(
        (v) => {
          const n = Number(v)
          return Number.isInteger(n) && n >= 0 && n <= YEARS_EXPERIENCE_MAX
        },
        count(errors.yearsRange, YEARS_EXPERIENCE_MAX),
      ),
    locationName: z.string().trim().min(1, errors.area),
    locationLat: z.number().nullable(),
    locationLng: z.number().nullable(),
    travelRadiusMiles: z
      .string()
      .trim()
      .refine(
        (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) > 0),
        errors.radius,
      ),
    portfolioUrls: z.array(z.string()),
  })
}

export type WorkerFormValues = z.infer<
  ReturnType<typeof createWorkerFormSchema>
>

export function workerFormValuesFromMe(me: MeSnapshot): WorkerFormValues {
  const lat = me.worker?.preferredLocation?.lat ?? me.worker?.locationLat
  const lng = me.worker?.preferredLocation?.lng ?? me.worker?.locationLng
  const locationLabel =
    me.worker?.preferredLocation?.name?.trim() ||
    me.worker?.preferredLocation?.address?.trim() ||
    me.worker?.locationAddress?.trim() ||
    ''

  return {
    legalName: me.worker?.legalName?.trim() || me.profile?.name?.trim() || '',
    tagline: me.worker?.tagline ?? '',
    bio: me.worker?.bio?.trim() ?? '',
    primaryCategory: categorySlugFromEnum(me.worker?.primaryCategory),
    skills: (me.worker?.skills ?? []).map((s) => s.trim()).filter(Boolean),
    qualifications: (me.worker?.qualifications ?? [])
      .map((q) => q.trim())
      .filter(Boolean),
    yearsExperience:
      typeof me.worker?.yearsExperience === 'number'
        ? String(me.worker.yearsExperience)
        : '',
    locationName: locationLabel,
    locationLat: typeof lat === 'number' && Number.isFinite(lat) ? lat : null,
    locationLng: typeof lng === 'number' && Number.isFinite(lng) ? lng : null,
    travelRadiusMiles:
      typeof me.worker?.travelRadiusMiles === 'number'
        ? String(me.worker.travelRadiusMiles)
        : '',
    portfolioUrls: (me.worker?.portfolioUrls ?? [])
      .map((url) => url.trim())
      .filter(Boolean),
  }
}

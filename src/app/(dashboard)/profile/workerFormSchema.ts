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
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'

/** Mirrors the setup-flow validation floor — no junk via the dashboard editor. */
export const workerFormSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(
      1,
      'Please enter your legal name as it should appear on your worker profile.',
    ),
  tagline: z
    .string()
    .trim()
    .min(
      HEADLINE_MIN_CHARS,
      `Add a professional headline of at least ${HEADLINE_MIN_CHARS} characters.`,
    )
    .max(
      HEADLINE_MAX_CHARS,
      `Keep your headline under ${HEADLINE_MAX_CHARS} characters.`,
    )
    .refine(
      (v) => v.split(/\s+/).filter(Boolean).length >= 2,
      'Use a few words, e.g. "Handyman with 8 years experience".',
    ),
  bio: z
    .string()
    .trim()
    .min(
      BIO_MIN_CHARS,
      `Write at least ${BIO_MIN_CHARS} characters — customers read this before accepting your quote.`,
    )
    .max(BIO_MAX_CHARS, `Keep your bio under ${BIO_MAX_CHARS} characters.`)
    .refine(
      (v) => !isJunkBio(v),
      'Tell customers about your work in full sentences — this reads as placeholder text.',
    ),
  primaryCategory: z.string().min(1, 'Choose the kind of work you do most.'),
  skills: z
    .array(z.string())
    .min(
      SKILLS_MIN,
      `Add at least ${SKILLS_MIN} skills so customers can find you for the right tasks.`,
    )
    .max(
      SKILLS_MAX,
      `Keep it to ${SKILLS_MAX} skills — lead with the work you do best.`,
    ),
  qualifications: z.array(z.string()).max(QUALIFICATIONS_MAX),
  yearsExperience: z
    .string()
    .trim()
    .min(1, 'Enter your years of experience.')
    .refine((v) => {
      const n = Number(v)
      return Number.isInteger(n) && n >= 0 && n <= YEARS_EXPERIENCE_MAX
    }, `Enter a whole number between 0 and ${YEARS_EXPERIENCE_MAX}.`),
  locationName: z.string().trim().min(1, 'Please add a service area.'),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  travelRadiusMiles: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) > 0),
      'Travel radius must be a positive number of miles.',
    ),
  portfolioUrls: z.array(z.string()),
})

export type WorkerFormValues = z.infer<typeof workerFormSchema>

export function workerFormValuesFromMe(me: MeSnapshot): WorkerFormValues {
  const lat = me.worker?.location?.lat ?? me.worker?.locationLat
  const lng = me.worker?.location?.lng ?? me.worker?.locationLng
  const locationLabel =
    me.worker?.location?.name?.trim() ||
    me.worker?.location?.address?.trim() ||
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

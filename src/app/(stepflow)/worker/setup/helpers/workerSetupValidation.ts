import type { MeWorkerSetupQuery } from '@codegen/schema'
import { z } from 'zod'

import { categoryEnumFromSlug } from './workerSetupCategories'
import type { WorkerSetupFormState } from './workerSetupFormState'
import { SKILLS_MAX, SKILLS_MIN } from './workerSetupSkills'
import type { WorkerSetupSubStepId } from './workerSetupSteps.config'

export const BIO_MIN_CHARS = 80
export const BIO_MAX_CHARS = 300
export const HEADLINE_MIN_CHARS = 10
export const HEADLINE_MAX_CHARS = 80
export const YEARS_EXPERIENCE_MAX = 60

/**
 * Junk-content floor for the bio: passes with at least 10 distinct characters
 * OR at least 12 words. Catches "oooooo…" and single-word walls that clear the
 * length minimum without saying anything.
 */
export function isJunkBio(bio: string): boolean {
  const distinctChars = new Set(bio.replace(/\s+/g, '').toLowerCase()).size
  const wordCount = bio.split(/\s+/).filter(Boolean).length
  return distinctChars < 10 && wordCount < 12
}

const detailsSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
})

const dateOfBirthSchema = z.object({
  dateOfBirth: z
    .string()
    .trim()
    .min(1, 'Enter your date of birth.')
    .refine((value) => {
      const d = new Date(`${value}T00:00:00.000Z`)
      if (Number.isNaN(d.getTime())) return false
      const now = new Date()
      let age = now.getUTCFullYear() - d.getUTCFullYear()
      const monthDiff = now.getUTCMonth() - d.getUTCMonth()
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && now.getUTCDate() < d.getUTCDate())
      ) {
        age -= 1
      }
      return age >= 18
    }, 'You must be at least 18 years old.'),
})

const bioSchema = z.object({
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
})

const experienceSchema = z.object({
  yearsExperience: z
    .string()
    .trim()
    .min(1, 'Enter your years of experience.')
    .refine((v) => {
      const n = Number(v)
      return Number.isInteger(n) && n >= 0 && n <= YEARS_EXPERIENCE_MAX
    }, `Enter a whole number between 0 and ${YEARS_EXPERIENCE_MAX}.`),
})

const locationSchema = z.object({
  locationName: z.string().trim().min(1, 'Add your primary service area.'),
})

export function validateWorkerSetupSubStep(
  subStepId: WorkerSetupSubStepId,
  form: WorkerSetupFormState,
  me: MeWorkerSetupQuery['me'],
): Record<string, string> {
  const errors: Record<string, string> = {}

  // First issue per field wins — length errors read better than the
  // content-heuristic message when both fire.
  const mergeZodErrors = (result: {
    success: boolean
    error?: z.ZodError
  }) => {
    if (result.success || !result.error) return
    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in errors)) {
        errors[key] = issue.message
      }
    }
  }

  switch (subStepId) {
    case 'profile.details': {
      // Headline + bio moved to their dedicated `profile.bio` step — asking
      // for an 80-char bio on the first screen buries the flow.
      mergeZodErrors(detailsSchema.safeParse(form))
      break
    }
    case 'profile.photo': {
      mergeZodErrors(dateOfBirthSchema.safeParse(form))
      if (!me.profile?.avatarUrl?.trim()) {
        errors.avatar = 'Add a profile photo to continue.'
      }
      break
    }
    case 'profile.bio': {
      mergeZodErrors(bioSchema.safeParse(form))
      break
    }
    case 'services.skills': {
      if (!form.primaryCategory) {
        errors.primaryCategory = 'Choose the kind of work you do most.'
      }
      if (form.skills.length < SKILLS_MIN) {
        errors.skills = `Add at least ${SKILLS_MIN} skills so customers can find you for the right tasks.`
      } else if (form.skills.length > SKILLS_MAX) {
        errors.skills = `Keep it to ${SKILLS_MAX} skills — lead with the work you do best.`
      }
      break
    }
    case 'services.experience': {
      const result = experienceSchema.safeParse(form)
      if (!result.success) {
        errors.yearsExperience = result.error.issues[0]?.message ?? 'Required'
      }
      break
    }
    case 'area.location': {
      const result = locationSchema.safeParse(form)
      if (!result.success) {
        errors.locationName = result.error.issues[0]?.message ?? 'Required'
      }
      break
    }
    case 'verify.phone':
      // BE finalize + registerAsPro require a strictly verified PHONE
      // (2026-07-13) — a verified email alone no longer unlocks quoting.
      if (!me.phoneVerified) {
        errors.contact =
          'Verify your phone number below before continuing — Slashie requires a verified phone to send quotes.'
      }
      break
    default:
      break
  }

  return errors
}

export function subStepsToSaveOnContinue(
  subStepId: WorkerSetupSubStepId,
): WorkerSetupSubStepId[] {
  switch (subStepId) {
    case 'profile.photo':
      return ['profile.details', 'profile.photo']
    default:
      return [subStepId]
  }
}

export function buildSavePayload(
  subStepId: WorkerSetupSubStepId,
  form: WorkerSetupFormState,
  avatarUrl?: string | null,
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
      return avatarUrl?.trim() ? { avatarUrl: avatarUrl.trim() } : {}
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
      if (
        form.locationLat == null ||
        form.locationLng == null ||
        !Number.isFinite(form.locationLat) ||
        !Number.isFinite(form.locationLng)
      ) {
        return {
          location: {
            name: label,
            address: label,
            lat: null,
            lng: null,
          },
        }
      }
      return {
        location: {
          name: label,
          address: label,
          lat: form.locationLat,
          lng: form.locationLng,
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

import type { MeWorkerSetupQuery } from '@codegen/schema'
import { z } from 'zod'

import type { WorkerSetupFormState } from './workerSetupFormState'
import { parsePortfolioText, parseSkillsText } from './workerSetupFormState'
import type { WorkerSetupSubStepId } from './workerSetupSteps.config'

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
    .min(1, 'Write a short bio about your skills and experience.')
    .max(300, 'Keep your bio under 300 characters.'),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
})

const skillsSchema = z.object({
  skillsText: z
    .string()
    .trim()
    .min(1, 'List at least one skill or service you offer.'),
})

const experienceSchema = z.object({
  yearsExperience: z
    .string()
    .trim()
    .min(1, 'Enter your years of experience.')
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 0,
      'Years of experience must be 0 or greater.',
    ),
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

  const mergeZodErrors = (result: {
    success: boolean
    error?: z.ZodError
  }) => {
    if (result.success || !result.error) return
    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string') errors[key] = issue.message
    }
  }

  switch (subStepId) {
    case 'profile.details': {
      mergeZodErrors(detailsSchema.safeParse(form))
      mergeZodErrors(bioSchema.safeParse(form))
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
      const result = bioSchema.safeParse(form)
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = issue.path[0]
          if (typeof key === 'string') errors[key] = issue.message
        }
      }
      break
    }
    case 'services.skills': {
      const result = skillsSchema.safeParse(form)
      if (!result.success) {
        errors.skillsText = result.error.issues[0]?.message ?? 'Required'
      } else if (parseSkillsText(form.skillsText).length === 0) {
        errors.skillsText = 'List at least one skill or service you offer.'
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
      if (!me.emailVerified && !me.phoneVerified) {
        errors.contact =
          'Verify your email or phone number below before continuing.'
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
    case 'profile.details':
      return ['profile.details', 'profile.bio']
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
        tagline: form.tagline.trim() || undefined,
        bio: form.bio.trim(),
      }
    case 'services.skills':
      return { skills: parseSkillsText(form.skillsText) }
    case 'services.experience':
      return {
        yearsExperience: Number.parseInt(form.yearsExperience.trim(), 10),
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
      return { portfolioUrls: parsePortfolioText(form.portfolioText) }
    default:
      return {}
  }
}

import { z } from 'zod'

import type { ProRegistrationInput } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'

export const workerFormSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(
      1,
      'Please enter your legal name as it should appear on your worker profile.',
    ),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
  bio: z
    .string()
    .trim()
    .min(1, 'Write a short bio about your skills and experience.')
    .max(800, 'Keep your bio under 800 characters.'),
  yearsExperience: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0),
      'Years of experience must be 0 or greater.',
    ),
  locationName: z.string().trim().min(1, 'Please add a service area.'),
})

export type WorkerFormValues = z.infer<typeof workerFormSchema>

export function workerFormValuesFromMe(me: MeSnapshot): WorkerFormValues {
  return {
    legalName: me.worker?.legalName?.trim() || me.profile?.name?.trim() || '',
    tagline: me.worker?.tagline ?? '',
    bio: me.worker?.bio?.trim() ?? me.profile?.bio?.trim() ?? '',
    yearsExperience:
      typeof me.worker?.yearsExperience === 'number'
        ? String(me.worker.yearsExperience)
        : '',
    locationName: me.worker?.locationAddress ?? '',
  }
}

export function workerFormToMutationInput(
  values: WorkerFormValues,
): ProRegistrationInput {
  const yearsExperienceInt =
    values.yearsExperience.trim() === ''
      ? undefined
      : Number.parseInt(values.yearsExperience, 10)
  const locationName = values.locationName.trim()

  return {
    legalName: values.legalName.trim(),
    bio: values.bio.trim(),
    tagline: values.tagline?.trim() || undefined,
    yearsExperience: yearsExperienceInt,
    location: {
      address: locationName,
      name: locationName,
      lat: null,
      lng: null,
    },
  }
}

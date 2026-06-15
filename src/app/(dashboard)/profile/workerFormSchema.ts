import { z } from 'zod'

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
    .max(300, 'Keep your bio under 300 characters.'),
  skillsText: z
    .string()
    .trim()
    .min(1, 'List at least one skill or service you offer.'),
  yearsExperience: z
    .string()
    .trim()
    .min(1, 'Enter your years of experience.')
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 0,
      'Years of experience must be 0 or greater.',
    ),
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
  portfolioText: z.string(),
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
    skillsText: (me.worker?.skills ?? []).join(', '),
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
    portfolioText: (me.worker?.portfolioUrls ?? []).join('\n'),
  }
}

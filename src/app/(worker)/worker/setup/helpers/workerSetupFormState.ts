import type { MeWorkerSetupQuery } from '@codegen/schema'

import { dateInputValueFromIso } from '@/app/(dashboard)/profile/profileFormSchema'

export type WorkerSetupFormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  tagline: string
  bio: string
  skillsText: string
  yearsExperience: string
  locationName: string
  locationLat: number | null
  locationLng: number | null
  travelRadiusMiles: string
  portfolioText: string
}

export const emptyWorkerSetupFormState = (): WorkerSetupFormState => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  tagline: '',
  bio: '',
  skillsText: '',
  yearsExperience: '',
  locationName: '',
  locationLat: null,
  locationLng: null,
  travelRadiusMiles: '',
  portfolioText: '',
})

function splitLegalName(legalName: string | null | undefined): {
  firstName: string
  lastName: string
} {
  const full = legalName?.trim() || ''
  if (!full) return { firstName: '', lastName: '' }
  const parts = full.split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

export function formStateFromMeWorkerSetup(
  data: MeWorkerSetupQuery['me'],
): WorkerSetupFormState {
  const profile = data.profile
  const worker = data.worker
  const fromLegal = splitLegalName(worker?.legalName)
  const fromProfile = splitLegalName(profile?.name)

  const firstName = fromLegal.firstName || fromProfile.firstName
  const lastName = fromLegal.lastName || fromProfile.lastName

  const locationLabel =
    worker?.location?.name?.trim() || worker?.location?.address?.trim() || ''
  const lat = worker?.location?.lat
  const lng = worker?.location?.lng

  return {
    firstName,
    lastName,
    dateOfBirth: dateInputValueFromIso(profile?.dateOfBirth),
    tagline: worker?.tagline?.trim() ?? '',
    bio: worker?.bio?.trim() ?? '',
    skillsText: (worker?.skills ?? []).join(', '),
    yearsExperience:
      typeof worker?.yearsExperience === 'number'
        ? String(worker.yearsExperience)
        : '',
    locationName: locationLabel,
    locationLat: typeof lat === 'number' && Number.isFinite(lat) ? lat : null,
    locationLng: typeof lng === 'number' && Number.isFinite(lng) ? lng : null,
    travelRadiusMiles:
      typeof worker?.travelRadiusMiles === 'number'
        ? String(worker.travelRadiusMiles)
        : '',
    portfolioText: (worker?.portfolioUrls ?? []).join('\n'),
  }
}

export function parseSkillsText(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function parsePortfolioText(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

import type { MeWorkerSetupQuery } from '@codegen/schema'

import { dateInputValueFromIso } from '@/app/(dashboard)/profile/profileFormSchema'

import { categorySlugFromEnum } from './workerSetupCategories'

export type WorkerSetupFormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  /** Professional headline (saved to the worker `tagline` field). */
  tagline: string
  bio: string
  /** Primary trade slug ({@link workerSetupCategories}); saved as the `primaryCategory` enum. */
  primaryCategory: string
  /** Selected skill chips — the same string[] shape as the `skills` payload. */
  skills: string[]
  yearsExperience: string
  /** Qualification chips (e.g. "Gas Safe") — `qualifications` payload, max 10. */
  qualifications: string[]
  locationName: string
  locationLat: number | null
  locationLng: number | null
  travelRadiusMiles: string
  /** Portfolio item URLs — the same string[] shape as the `portfolioUrls` payload. */
  portfolioUrls: string[]
}

export const emptyWorkerSetupFormState = (): WorkerSetupFormState => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  tagline: '',
  bio: '',
  primaryCategory: '',
  skills: [],
  yearsExperience: '',
  qualifications: [],
  locationName: '',
  locationLat: null,
  locationLng: null,
  travelRadiusMiles: '',
  portfolioUrls: [],
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
    // BE reads are rollout-tolerant: legacy skills[0] trade labels are
    // inferred into primaryCategory and stripped from skills server-side.
    primaryCategory: categorySlugFromEnum(worker?.primaryCategory),
    skills: (worker?.skills ?? []).map((s) => s.trim()).filter(Boolean),
    qualifications: (worker?.qualifications ?? [])
      .map((q) => q.trim())
      .filter(Boolean),
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
    portfolioUrls: (worker?.portfolioUrls ?? [])
      .map((url) => url.trim())
      .filter(Boolean),
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

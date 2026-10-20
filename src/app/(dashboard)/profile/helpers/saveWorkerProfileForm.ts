import type { ApolloClient } from '@apollo/client'
import {
  type MeQuery,
  type SaveWorkerSetupStepInput,
  type SaveWorkerSetupStepMutation,
  type UpdateWorkerProfileInput,
  type UpdateWorkerProfileMutation,
  type UpdateWorkerProfileMutationVariables,
  WorkerPublishState,
} from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import SaveWorkerSetupStep from '@/app/(stepflow)/worker/setup/graphql/SaveWorkerSetupStep.gql'
import { categoryEnumFromSlug } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { resolveWorkerSetupLocation } from '@/app/(stepflow)/worker/setup/helpers/workerSetupLocation'
import { mergeSaveWorkerSetupIntoMe } from '@/app/(stepflow)/worker/setup/helpers/workerSetupSyncMe'

import UpdateWorkerProfile from '../graphql/UpdateWorkerProfile.gql'
import type { WorkerFormValues } from '../workerFormSchema'

/**
 * A save the form stops before the API: the service area did not geocode
 * (shown with LOCATION_REQUIRED's copy) or no trade is chosen
 * (PRIMARY_CATEGORY_REQUIRED). The form maps `code` to its bag.
 */
export class WorkerProfileSaveError extends Error {
  constructor(
    readonly code: 'LOCATION_REQUIRED' | 'PRIMARY_CATEGORY_REQUIRED',
  ) {
    super(code)
    this.name = 'WorkerProfileSaveError'
  }
}

function splitLegalName(legalName: string): {
  firstName: string
  lastName: string
} {
  const parts = legalName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}

async function resolveLocation(values: WorkerFormValues) {
  const resolved = await resolveWorkerSetupLocation({
    locationName: values.locationName,
    locationLat: values.locationLat,
    locationLng: values.locationLng,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    tagline: '',
    bio: '',
    primaryCategory: '',
    skills: [],
    yearsExperience: '',
    qualifications: [],
    travelRadiusMiles: '',
    portfolioUrls: [],
  })
  if (!resolved) throw new WorkerProfileSaveError('LOCATION_REQUIRED')
  return resolved.location
}

function travelRadius(values: WorkerFormValues): number | undefined {
  const raw = values.travelRadiusMiles.trim()
  return raw === '' ? undefined : Number.parseFloat(raw)
}

/** The `updateWorkerProfile` input: every field the finished-profile editor saves. */
export function updateWorkerProfileInput(
  values: WorkerFormValues,
  location: UpdateWorkerProfileInput['location'],
): UpdateWorkerProfileInput {
  const primaryCategory = categoryEnumFromSlug(values.primaryCategory)
  if (!primaryCategory) {
    throw new WorkerProfileSaveError('PRIMARY_CATEGORY_REQUIRED')
  }
  return {
    legalName: values.legalName.trim(),
    tagline: values.tagline.trim(),
    bio: values.bio.trim(),
    primaryCategory,
    skills: values.skills,
    yearsExperience: Number.parseInt(values.yearsExperience.trim(), 10),
    qualifications: values.qualifications,
    location,
    travelRadiusMiles: travelRadius(values) ?? null,
    portfolioUrls: values.portfolioUrls,
  }
}

type UpdatedWorker = UpdateWorkerProfileMutation['updateWorkerProfile']

/** Folds the saved worker into `me`, keeping what the mutation doesn't return. */
function mergeUpdatedWorkerIntoMe(
  me: MeSnapshot,
  saved: UpdatedWorker,
): MeSnapshot {
  return {
    ...me,
    worker: {
      ...me.worker,
      ...saved,
    } as NonNullable<MeQuery['me']['worker']>,
  }
}

/**
 * Saves the Profile page's worker editor. A finished profile is one
 * `updateWorkerProfile` call; a draft (publishState DRAFT) keeps the worker
 * setup path, one `saveWorkerSetupStep` per sub-step. API errors are thrown
 * as they come, so the form can show each code's copy.
 */
export async function saveWorkerProfileForm(
  client: ApolloClient,
  values: WorkerFormValues,
  me: MeSnapshot,
  setMe: (me: MeSnapshot | null) => void,
): Promise<void> {
  const location = await resolveLocation(values)

  if (me.worker?.publishState !== WorkerPublishState.Draft) {
    const result = await client.mutate<
      UpdateWorkerProfileMutation,
      UpdateWorkerProfileMutationVariables
    >({
      mutation: UpdateWorkerProfile,
      variables: { input: updateWorkerProfileInput(values, location) },
    })
    const saved = result.data?.updateWorkerProfile
    if (saved) setMe(mergeUpdatedWorkerIntoMe(me, saved))
    return
  }

  let currentMe = me
  const { firstName, lastName } = splitLegalName(values.legalName)
  const steps: SaveWorkerSetupStepInput[] = [
    {
      subStep: 'profile.details',
      firstName,
      lastName,
      legalName: values.legalName.trim(),
    },
    {
      subStep: 'profile.bio',
      tagline: values.tagline.trim(),
      bio: values.bio.trim(),
    },
    {
      subStep: 'services.skills',
      primaryCategory: categoryEnumFromSlug(values.primaryCategory),
      skills: values.skills,
    },
    {
      subStep: 'services.experience',
      yearsExperience: Number.parseInt(values.yearsExperience.trim(), 10),
      qualifications: values.qualifications,
    },
    { subStep: 'area.location', location },
    { subStep: 'area.travel', travelRadiusMiles: travelRadius(values) },
    { subStep: 'verify.portfolio', portfolioUrls: values.portfolioUrls },
  ]

  for (const input of steps) {
    const result = await client.mutate<SaveWorkerSetupStepMutation>({
      mutation: SaveWorkerSetupStep,
      variables: { input },
    })
    const saved = result.data?.saveWorkerSetupStep
    if (saved) {
      currentMe = mergeSaveWorkerSetupIntoMe(currentMe, saved)
      setMe(currentMe)
    }
  }
}

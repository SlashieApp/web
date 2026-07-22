import type { ApolloClient } from '@apollo/client'
import type {
  SaveWorkerSetupStepInput,
  SaveWorkerSetupStepMutation,
} from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import SaveWorkerSetupStep from '@/app/(stepflow)/worker/setup/graphql/SaveWorkerSetupStep.gql'
import { categoryEnumFromSlug } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { resolveWorkerSetupLocation } from '@/app/(stepflow)/worker/setup/helpers/workerSetupLocation'
import { mergeSaveWorkerSetupIntoMe } from '@/app/(stepflow)/worker/setup/helpers/workerSetupSyncMe'

import type { WorkerFormValues } from '../workerFormSchema'

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

export async function saveWorkerProfileForm(
  client: ApolloClient,
  values: WorkerFormValues,
  me: MeSnapshot,
  setMe: (me: MeSnapshot | null) => void,
): Promise<void> {
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
  ]

  const locationState = {
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
  }

  const resolved = await resolveWorkerSetupLocation(locationState)
  if (!resolved) {
    throw new Error(
      "We couldn't find that service area. Try a city name or full postcode.",
    )
  }

  steps.push({
    subStep: 'area.location',
    location: resolved.location,
  })

  const travelRaw = values.travelRadiusMiles.trim()
  steps.push({
    subStep: 'area.travel',
    travelRadiusMiles:
      travelRaw === '' ? undefined : Number.parseFloat(travelRaw),
  })

  steps.push({
    subStep: 'verify.portfolio',
    portfolioUrls: values.portfolioUrls,
  })

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

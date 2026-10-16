'use client'

import { Box, Stack } from '@chakra-ui/react'

import { PublicProfileHero } from '@/app/(presence)/profile/[userId]/components/ui/PublicProfileHero'
import {
  ProfileAboutSection,
  ProfileSkillsSection,
} from '@/app/(presence)/profile/[userId]/components/ui/PublicProfileSections'
import {
  profileStats,
  workerHeadline,
} from '@/app/(presence)/profile/[userId]/helpers/publicProfileModel'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { categoryEnumFromSlug } from '../../../helpers/workerSetupCategories'

/**
 * Review-step preview drawn with the public profile's own hero, About and
 * Skills, fed from the in-progress form. Static: pointer events are off.
 */
export function WorkerSetupProfilePreview() {
  const { form, bootstrap } = useWorkerSetup()

  const years = Number.parseInt(form.yearsExperience.trim(), 10)
  const radius = Number.parseFloat(form.travelRadiusMiles.trim())
  const area = form.locationName.trim()
  const stats = profileStats(['experience'], {
    ratingCount: 0,
    ratingAverage: null,
    completedJobs: [],
    yearsExperience: Number.isInteger(years) && years > 0 ? years : null,
    openTaskCount: 0,
    joinedLabel: null,
  })

  return (
    <Box
      pointerEvents="none"
      userSelect="none"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.strong"
      bg="bg.canvas"
      p={{ base: 3, md: 4 }}
    >
      <Stack gap={4}>
        <PublicProfileHero
          nameAs="h3"
          stats={stats}
          model={{
            name: `${form.firstName} ${form.lastName}`.trim(),
            avatarUrl: bootstrap?.profile?.avatarUrl?.trim() || null,
            verified: false,
            isWorker: true,
            headline: workerHeadline(
              categoryEnumFromSlug(form.primaryCategory),
              form.skills,
            ),
            tagline: form.tagline.trim() || null,
            serviceAreaLabel:
              area && Number.isFinite(radius) && radius > 0
                ? `${area} (~${Math.round(radius)} miles)`
                : area || null,
          }}
        />
        <ProfileAboutSection bio={form.bio.trim() || null} />
        <ProfileSkillsSection
          skills={form.skills}
          qualifications={form.qualifications}
        />
      </Stack>
    </Box>
  )
}

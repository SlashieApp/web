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
import { useI11n } from '@/i18n/useI11n'
import { townOnly } from '@/utils/taskLocationDisplay'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { categoryEnumFromSlug } from '../../../helpers/workerSetupCategories'
import bag from '../../../i11n.json'

/**
 * The review's preview, drawn with the public profile's own hero, About and
 * Skills from the form. Shows the town only, as the API does. Static:
 * pointer events are off.
 */
export function WorkerSetupProfilePreview() {
  const trades = useI11n(bag).trades
  const { form, account } = useWorkerSetup()

  const years = Number.parseInt(form.yearsExperience.trim(), 10)
  const radius = Number.parseFloat(form.travelRadiusMiles.trim())
  const town = townOnly(form.locationName)
  const stats = profileStats(['experience'], {
    ratingCount: 0,
    ratingAverage: null,
    completedJobsCount: 0,
    hostedCompletedCount: 0,
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
            avatarUrl: account.avatarUrl,
            verified: false,
            isWorker: true,
            headline: workerHeadline(
              categoryEnumFromSlug(form.primaryCategory),
              form.skills,
              trades,
            ),
            tagline: form.tagline.trim() || null,
            serviceAreaLabel:
              town && Number.isFinite(radius) && radius > 0
                ? `${town} (~${Math.round(radius)} miles)`
                : town,
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

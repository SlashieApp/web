'use client'

import { Box, Stack } from '@chakra-ui/react'
import { IdentityVerificationStatus } from '@codegen/schema'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'

import {
  WorkerAboutSection,
  WorkerProfileHero,
  WorkerSkillsSection,
} from '@/app/(worker)/workers/[slug]/components'
import { WorkerProfileProvider } from '@/app/(worker)/workers/[slug]/context/WorkerProfileContext'
import type { WorkerPublicRecord } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'

import { useWorkerSetup } from '../../context/WorkerSetupProvider'
import { categoryEnumFromSlug } from '../../helpers/workerSetupCategories'

/**
 * Live review-step preview rendered with the SAME components as the public
 * /workers/[slug] page (hero, About, Skills), fed from the in-progress form.
 * Static — pointer events are disabled so the hero's link/actions are inert.
 */
export function WorkerSetupProfilePreview() {
  const { form, bootstrap } = useWorkerSetup()
  const me = useUserStore((s) => s.me)

  const fullName = `${form.firstName} ${form.lastName}`.trim()
  const years = Number.parseInt(form.yearsExperience.trim(), 10)
  const radius = Number.parseFloat(form.travelRadiusMiles.trim())
  const area = form.locationName.trim()

  const previewWorker: WorkerPublicRecord = {
    id: 'setup-preview',
    bio: form.bio.trim() || null,
    tagline: form.tagline.trim() || null,
    primaryCategory: categoryEnumFromSlug(form.primaryCategory) ?? null,
    isVerified: false,
    identityVerification: IdentityVerificationStatus.NotStarted,
    phoneVerified: isPhoneVerified(me),
    emailVerified: isEmailVerified(me),
    yearsExperience: Number.isInteger(years) && years >= 0 ? years : null,
    averageResponseTime: null,
    tasksCompletedCount: 0,
    quotesSentCount: 0,
    memberSince: null,
    legalName: fullName || null,
    skills: form.skills,
    qualifications: form.qualifications,
    portfolioUrls: form.portfolioUrls,
    serviceAreaLabel:
      area && Number.isFinite(radius) && radius > 0
        ? `${area} (~${Math.round(radius)} miles)`
        : area || null,
    serviceArea: {
      label: area || null,
      radiusMiles: Number.isFinite(radius) && radius > 0 ? radius : null,
    },
    preferredLocation: { name: area || null },
    ratingSummary: { average: null, count: 0 },
    completedJobs: [],
    viewer: null,
    user: { id: 'setup-preview-user', createdAt: new Date().toISOString() },
    profile: {
      avatarUrl: bootstrap?.profile?.avatarUrl?.trim() || null,
      name: fullName || null,
    },
  }

  return (
    <Box
      pointerEvents="none"
      userSelect="none"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.strong"
    >
      <WorkerProfileProvider worker={previewWorker}>
        <Stack gap={4} bg="bg.canvas" pb={4}>
          <WorkerProfileHero />
          <Stack gap={4} px={{ base: 3, md: 5 }}>
            <WorkerAboutSection />
            <WorkerSkillsSection skills={previewWorker.skills} />
          </Stack>
        </Stack>
      </WorkerProfileProvider>
    </Box>
  )
}

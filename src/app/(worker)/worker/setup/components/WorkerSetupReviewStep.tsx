'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import {
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Button } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import type { WorkerSetupSubStepId } from '../helpers/workerSetupSteps.config'
import { WORKER_SETUP_MAJOR_STEPS } from '../helpers/workerSetupSteps.config'

type ReviewSectionProps = {
  title: string
  editSubStep: WorkerSetupSubStepId
  onEdit: (subStep: WorkerSetupSubStepId) => void
  children: React.ReactNode
}

function ReviewSection({
  title,
  editSubStep,
  onEdit,
  children,
}: ReviewSectionProps) {
  return (
    <Stack gap={2}>
      <Text fontSize="md" fontWeight={700} color="text.default">
        {title}
      </Text>
      <Box
        borderWidth="1px"
        borderColor="border.strong"
        borderRadius="lg"
        bg="bg.surface"
        position="relative"
      >
        <Box position="absolute" top={3} right={3} zIndex={1}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            color="text.muted"
            fontWeight={600}
            minH="32px"
            px={3}
            onClick={() => onEdit(editSubStep)}
          >
            Edit
          </Button>
        </Box>
        <Stack gap={4} p={{ base: 4, md: 5 }} pr={{ base: 16, md: 20 }}>
          {children}
        </Stack>
      </Box>
    </Stack>
  )
}

function ReviewField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <Stack gap={0.5}>
      <Text fontSize="sm" color="text.muted">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text
          fontSize="sm"
          color="text.default"
          fontWeight={500}
          lineHeight="tall"
        >
          {value.trim() ? value : '—'}
        </Text>
      ) : (
        value
      )}
    </Stack>
  )
}

function formatDateOfBirth(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const date = new Date(`${trimmed}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return trimmed
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function WorkerSetupReviewStep() {
  const { form, bootstrap, goToSubStep, workerEligibility } = useWorkerSetup()
  const me = useUserStore((s) => s.me)

  const fullName = `${form.firstName} ${form.lastName}`.trim()
  const avatarUrl = bootstrap?.profile?.avatarUrl?.trim()
  const savedPhone = profileContactNumber(me)
  const emailVerified = isEmailVerified(me)
  const phoneVerified = isPhoneVerified(me)
  const portfolioLines = form.portfolioText
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const reviewSections = WORKER_SETUP_MAJOR_STEPS.filter(
    (major) => major.id !== 'review',
  )

  return (
    <Stack gap={6}>
      {reviewSections.map((major) => {
        const editSubStep = major.subSteps[0]?.id
        if (!editSubStep) return null

        return (
          <ReviewSection
            key={major.id}
            title={major.label}
            editSubStep={editSubStep}
            onEdit={goToSubStep}
          >
            {major.id === 'profile' ? (
              <>
                <ReviewField label="Name" value={fullName} />
                {form.tagline ? (
                  <ReviewField label="Tagline" value={form.tagline} />
                ) : null}
                <ReviewField label="Short bio" value={form.bio} />
                <ReviewField
                  label="Profile photo"
                  value={
                    avatarUrl ? (
                      <HStack gap={3} align="center">
                        <Box
                          boxSize="40px"
                          borderRadius="full"
                          overflow="hidden"
                          bg="status.success.soft"
                          flexShrink={0}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatarUrl}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                        <Text
                          fontSize="sm"
                          color="text.default"
                          fontWeight={500}
                        >
                          Photo added
                        </Text>
                      </HStack>
                    ) : (
                      'Not added'
                    )
                  }
                />
                <ReviewField
                  label="Date of birth"
                  value={formatDateOfBirth(form.dateOfBirth)}
                />
              </>
            ) : null}

            {major.id === 'services' ? (
              <>
                <ReviewField
                  label="Skills & services"
                  value={form.skillsText}
                />
                <ReviewField
                  label="Years of experience"
                  value={
                    form.yearsExperience.trim()
                      ? `${form.yearsExperience.trim()} years`
                      : ''
                  }
                />
              </>
            ) : null}

            {major.id === 'area' ? (
              <>
                <ReviewField
                  label="Primary service area"
                  value={form.locationName}
                />
                <ReviewField
                  label="Travel radius"
                  value={
                    form.travelRadiusMiles.trim()
                      ? `${form.travelRadiusMiles.trim()} miles`
                      : 'Not set'
                  }
                />
              </>
            ) : null}

            {major.id === 'verify' ? (
              <>
                <ReviewField
                  label="Email"
                  value={
                    me?.email
                      ? `${me.email}${emailVerified ? ' · Verified' : ' · Not verified'}`
                      : ''
                  }
                />
                <ReviewField
                  label="Phone"
                  value={
                    savedPhone
                      ? `${formatPhoneForDisplay(savedPhone)}${phoneVerified ? ' · Verified' : ' · Not verified'}`
                      : 'Not added'
                  }
                />
                <ReviewField
                  label="Portfolio links"
                  value={
                    portfolioLines.length > 0
                      ? portfolioLines.join('\n')
                      : 'Not added'
                  }
                />
              </>
            ) : null}
          </ReviewSection>
        )
      })}

      <Stack gap={2} pt={1}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {workerEligibility
            ? 'You meet the profile requirements to start quoting.'
            : 'Some profile requirements may still need attention. You can finish setup and update your profile if needed.'}
        </Text>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          After you start quoting, customers pay you directly for the work.
          Slashie does not process job payments.
        </Text>
      </Stack>
    </Stack>
  )
}

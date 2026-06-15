'use client'

import { useRef, useState } from 'react'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'

import { hasVerifiedContactMethod } from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useUserStore } from '@/app/(auth)/store/user'
import { PhoneVerificationBlock } from '@/app/(dashboard)/components/PhoneVerificationBlock'
import { apolloClient } from '@/utils/apolloClient'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/utils/profileAvatarUpload'
import { Button, FormField, Input, Textarea } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { WorkerSetupOptionalBadge } from './WorkerSetupOptionalBadge'

export function WorkerSetupStepContent() {
  const {
    activeSubStep,
    bootstrap,
    form,
    fieldErrors,
    patchForm,
    workerEligibility,
  } = useWorkerSetup()
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  if (!bootstrap) return null

  const avatarUrl = bootstrap.profile?.avatarUrl?.trim() || null
  const displayInitial =
    `${form.firstName}${form.lastName}`.trim().charAt(0).toUpperCase() || '?'

  const handleAvatarPick = () => inputRef.current?.click()

  const handleAvatarFile = async (file: File | undefined) => {
    if (!file || !bootstrap.profile) return
    const validationError = validateAvatarFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadProfileAvatar(apolloClient, file)
      patchMe({
        profile: { ...bootstrap.profile, avatarUrl: url },
      })
      patchForm({})
    } catch (error: unknown) {
      setUploadError(
        getFriendlyErrorMessage(error, 'Could not upload profile photo.'),
      )
    } finally {
      setUploading(false)
    }
  }

  switch (activeSubStep) {
    case 'profile.details':
      return (
        <Stack gap={5}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <FormField label="First name" errorText={fieldErrors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => patchForm({ firstName: e.target.value })}
                placeholder="e.g. Jordan"
                minH="44px"
              />
            </FormField>
            <FormField label="Last name" errorText={fieldErrors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => patchForm({ lastName: e.target.value })}
                placeholder="e.g. Lee"
                minH="44px"
              />
            </FormField>
          </Grid>
          <FormField
            label="Date of birth"
            helperText="Private — used to confirm you meet the minimum age to work on Slashie."
            errorText={fieldErrors.dateOfBirth}
          >
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => patchForm({ dateOfBirth: e.target.value })}
              minH="44px"
            />
          </FormField>
        </Stack>
      )

    case 'profile.photo':
      return (
        <Stack gap={4}>
          <Text fontSize="sm" color="formLabelMuted">
            Customers trust workers with a clear profile photo. Use a friendly
            headshot or work photo.
          </Text>
          <HStack gap={4} align="center">
            <Box
              boxSize="88px"
              borderRadius="full"
              bg="primary.100"
              color="primary.700"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight={800}
              fontSize="2xl"
              overflow="hidden"
              flexShrink={0}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                displayInitial
              )}
            </Box>
            <Stack gap={2} align="flex-start">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={handleAvatarPick}
              >
                {avatarUrl ? 'Change photo' : 'Upload photo'}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void handleAvatarFile(e.target.files?.[0])}
              />
            </Stack>
          </HStack>
          {uploadError ? (
            <Text color="red.500" fontSize="sm">
              {uploadError}
            </Text>
          ) : null}
          {fieldErrors.avatar ? (
            <Text color="red.500" fontSize="sm">
              {fieldErrors.avatar}
            </Text>
          ) : null}
        </Stack>
      )

    case 'profile.bio':
      return (
        <Stack gap={5}>
          <FormField
            label={
              <HStack gap={2}>
                <Text as="span">Tagline</Text>
                <WorkerSetupOptionalBadge />
              </HStack>
            }
            errorText={fieldErrors.tagline}
          >
            <Input
              value={form.tagline}
              onChange={(e) => patchForm({ tagline: e.target.value })}
              placeholder="e.g. Reliable handyman in London"
              minH="44px"
            />
          </FormField>
          <FormField label="Short bio" errorText={fieldErrors.bio}>
            <Box position="relative">
              <Textarea
                value={form.bio}
                onChange={(e) => patchForm({ bio: e.target.value })}
                placeholder="Share your experience, skills, and what makes you reliable."
                rows={6}
                minH="120px"
                maxLength={300}
              />
              <Text
                position="absolute"
                bottom={2}
                right={3}
                fontSize="xs"
                color="formLabelMuted"
              >
                {form.bio.length} / 300
              </Text>
            </Box>
          </FormField>
        </Stack>
      )

    case 'services.skills':
      return (
        <FormField
          label="Skills & services"
          helperText="Separate skills with commas or new lines."
          errorText={fieldErrors.skillsText}
        >
          <Textarea
            value={form.skillsText}
            onChange={(e) => patchForm({ skillsText: e.target.value })}
            placeholder="e.g. Plumbing, furniture assembly, garden tidy-ups"
            rows={4}
            minH="120px"
          />
        </FormField>
      )

    case 'services.experience':
      return (
        <FormField
          label="Years of experience"
          helperText="How long you have been doing this kind of work."
          errorText={fieldErrors.yearsExperience}
        >
          <Input
            value={form.yearsExperience}
            onChange={(e) => patchForm({ yearsExperience: e.target.value })}
            inputMode="numeric"
            placeholder="3"
            minH="44px"
          />
        </FormField>
      )

    case 'area.location':
      return (
        <FormField
          label="Primary service area"
          helperText="City or postcode where you usually take jobs. We look up coordinates when you continue."
          errorText={fieldErrors.locationName}
        >
          <Input
            value={form.locationName}
            onChange={(e) =>
              patchForm({
                locationName: e.target.value,
                locationLat: null,
                locationLng: null,
              })
            }
            placeholder="London or WD17 2AW"
            minH="44px"
          />
        </FormField>
      )

    case 'area.travel':
      return (
        <FormField
          label={
            <HStack gap={2}>
              <Text as="span">Travel radius (miles)</Text>
              <WorkerSetupOptionalBadge />
            </HStack>
          }
          helperText="Optional — how far you are willing to travel for jobs."
        >
          <Input
            value={form.travelRadiusMiles}
            onChange={(e) => patchForm({ travelRadiusMiles: e.target.value })}
            inputMode="decimal"
            placeholder="10"
            minH="44px"
          />
        </FormField>
      )

    case 'verify.phone':
      return (
        <Stack gap={4}>
          <Text fontSize="sm" color="formLabelMuted">
            Verify your phone or email so customers can trust your profile.
            Payment is arranged directly between you and the customer outside
            Slashie.
          </Text>
          {hasVerifiedContactMethod(me as MeSnapshot) ? (
            <Text fontSize="sm" fontWeight={600} color="primary.700">
              Your contact is verified.
            </Text>
          ) : (
            <PhoneVerificationBlock compact />
          )}
          {fieldErrors.phone ? (
            <Text color="red.500" fontSize="sm">
              {fieldErrors.phone}
            </Text>
          ) : null}
        </Stack>
      )

    case 'verify.portfolio':
      return (
        <FormField
          label={
            <HStack gap={2}>
              <Text as="span">Portfolio links</Text>
              <WorkerSetupOptionalBadge />
            </HStack>
          }
          helperText="Optional — one URL per line."
        >
          <Textarea
            value={form.portfolioText}
            onChange={(e) => patchForm({ portfolioText: e.target.value })}
            placeholder="https://example.com/my-work"
            rows={4}
            minH="120px"
          />
        </FormField>
      )

    case 'review.submit':
      return (
        <Stack gap={4} fontSize="sm">
          <ReviewRow
            label="Name"
            value={`${form.firstName} ${form.lastName}`.trim()}
          />
          {form.tagline ? (
            <ReviewRow label="Tagline" value={form.tagline} />
          ) : null}
          <ReviewRow label="Bio" value={form.bio} />
          <ReviewRow label="Skills" value={form.skillsText} />
          <ReviewRow
            label="Experience"
            value={`${form.yearsExperience} years`}
          />
          <ReviewRow label="Service area" value={form.locationName} />
          {form.travelRadiusMiles ? (
            <ReviewRow
              label="Travel radius"
              value={`${form.travelRadiusMiles} miles`}
            />
          ) : null}
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            {workerEligibility
              ? 'You meet the profile requirements to start quoting.'
              : 'Some profile requirements may still need attention. You can finish setup and update your profile if needed.'}
          </Text>
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            After you start quoting, customers pay you directly for the work.
            Slashie does not process job payments.
          </Text>
        </Stack>
      )

    default:
      return null
  }
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={1}>
      <Text
        fontWeight={700}
        color="formLabelMuted"
        fontSize="xs"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text color="cardFg">{value || '—'}</Text>
    </Stack>
  )
}

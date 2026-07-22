'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { UpdateMyProfileMutation } from '@codegen/schema'
import { useRef, useState } from 'react'

import { MeAvatar } from '@/app/(auth)/components/MeAvatar'
import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMyProfile from '@/app/(dashboard)/profile/graphql/UpdateMyProfile.gql'
import {
  EVENTS,
  captureApiError,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { apolloClient } from '@/utils/apolloClient'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import {
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/utils/profileAvatarUpload'
import { Button, Card } from '@ui'

import { displayNameFromMe } from '../../profileDisplayHelpers'

export function ProfilePhotoCard({ onSaved }: { onSaved?: () => void } = {}) {
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [updateMyProfile] =
    useMutation<UpdateMyProfileMutation>(UpdateMyProfile)

  if (!me) return null

  const currentAvatar = me.profile?.avatarUrl?.trim() || null

  const handlePick = () => {
    setError(null)
    inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const validationError = validateAvatarFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)
    setError(null)

    try {
      const avatarUrl = await uploadProfileAvatar(apolloClient, file)
      const result = await updateMyProfile({
        variables: { input: { avatarUrl } },
      })
      const updated = result.data?.updateMyProfile
      if (updated?.profile && me.profile) {
        patchMe({
          profile: { ...me.profile, avatarUrl: updated.profile.avatarUrl },
          workerEligibility: updated.workerEligibility,
        })
      }
      trackFlowSucceeded(EVENTS.profile_update_success, { section: 'avatar' })
      showAppToast({ title: 'Profile photo updated' })
      onSaved?.()
    } catch (uploadError) {
      captureApiError(uploadError, {
        flow: 'profile_update',
        action: 'uploadProfileAvatar',
        source: 'upload',
        url_or_operation: 'GetProfileAvatarUpload',
        route: '/profile',
        report_global: false,
      })
      trackFlowFailed(EVENTS.profile_update_fail, uploadError, {
        flow: 'profile_update',
        action: 'uploadProfileAvatar',
        operation: 'UpdateMyProfile',
        route: '/profile',
        extra: { section: 'avatar' },
      })
      setError(
        getFriendlyErrorMessage(
          uploadError,
          'Could not upload your photo. Please try again.',
        ),
      )
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localPreview)
    }
  }

  return (
    <Card layout="section" id="profile-photo" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">Profile photo</Heading>
          <Text fontSize="sm" color="text.muted">
            A clear photo helps customers and workers trust your profile.
          </Text>
        </Stack>

        <HStack gap={4} align="center" flexWrap="wrap">
          <MeAvatar
            size="xl"
            name={displayNameFromMe(me)}
            avatarUrl={previewUrl ?? currentAvatar}
            rootProps={{ opacity: uploading ? 0.6 : 1 }}
          />

          <Stack gap={2}>
            <HStack gap={3} flexWrap="wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePick}
                loading={uploading}
              >
                {currentAvatar ? 'Replace photo' : 'Upload photo'}
              </Button>
            </HStack>
            <Text fontSize="xs" color="text.muted">
              JPG, PNG, or WebP. Up to 5MB.
            </Text>
          </Stack>
        </HStack>

        {error ? (
          <Text color="status.danger.fg" fontSize="sm">
            {error}
          </Text>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => {
            void handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </Stack>
    </Card>
  )
}

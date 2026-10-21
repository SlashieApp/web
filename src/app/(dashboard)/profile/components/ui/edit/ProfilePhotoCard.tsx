'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { MeAvatar } from '@/app/(auth)/components/ui/MeAvatar'
import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import {
  EVENTS,
  captureApiError,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { apolloClient } from '@/utils/apolloClient'
import { showAppToast } from '@/utils/appToast'
import { imageUploadErrorCode } from '@/utils/graphqlErrors'
import {
  AVATAR_ACCEPTED_TYPES,
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/utils/profileAvatarUpload'
import { Button, Card } from '@ui'

import bag from '../../../i11n.json'
import { displayNameFromMe } from '../../../profileDisplayHelpers'

export function ProfilePhotoCard({ onSaved }: { onSaved?: () => void } = {}) {
  const t = useI11n(bag).photo
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!me) return null

  const currentAvatar = me.profile?.avatarUrl?.trim() || null

  const handlePick = () => {
    setError(null)
    inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateAvatarFile(file)
    if (problem) {
      setError(problem === 'type' ? t.wrongType : t.tooBig)
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setUploading(true)
    setError(null)

    try {
      // `finalizeAvatarUpload` saves the photo; this only refreshes `me`.
      const saved = await uploadProfileAvatar(apolloClient, file)
      if (me.profile) {
        patchMe({
          profile: { ...me.profile, avatarUrl: saved.profile.avatarUrl },
          workerEligibility: saved.workerEligibility,
        })
      }
      trackFlowSucceeded(EVENTS.profile_update_success, { section: 'avatar' })
      showAppToast({ title: t.updated })
      onSaved?.()
    } catch (uploadError) {
      captureApiError(uploadError, {
        flow: 'profile_update',
        action: 'uploadProfileAvatar',
        source: 'upload',
        url_or_operation: 'FinalizeAvatarUpload',
        route: '/profile',
        report_global: false,
      })
      trackFlowFailed(EVENTS.profile_update_fail, uploadError, {
        flow: 'profile_update',
        action: 'uploadProfileAvatar',
        operation: 'FinalizeAvatarUpload',
        route: '/profile',
        extra: { section: 'avatar' },
      })
      const code = imageUploadErrorCode(uploadError)
      setError(code ? t.serverErrors[code] : t.failed)
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
          <Heading size="md">{t.heading}</Heading>
          <Text fontSize="sm" color="text.muted">
            {t.body}
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
                minH="44px"
                variant="secondary"
                onClick={handlePick}
                loading={uploading}
              >
                {currentAvatar ? t.replace : t.upload}
              </Button>
            </HStack>
            <Text fontSize="xs" color="text.muted">
              {t.hint}
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
          accept={AVATAR_ACCEPTED_TYPES.join(',')}
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

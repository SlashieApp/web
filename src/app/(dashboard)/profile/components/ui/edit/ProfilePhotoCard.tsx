'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

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
import { isHeicFile, viewablePhoto } from '@/utils/heicPhoto'
import {
  AVATAR_ACCEPTED_TYPES,
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/utils/profileAvatarUpload'
import {
  Button,
  Card,
  PhotoSourcePicker,
  PhotoTile,
  type PhotoTileState,
} from '@ui'

import bag from '../../../i11n.json'
import { displayNameFromMe } from '../../../profileDisplayHelpers'

export function ProfilePhotoCard({ onSaved }: { onSaved?: () => void } = {}) {
  const t = useI11n(bag).photo
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Instead of the avatar while a HEIC converts, or when it can't be shown.
  const [tile, setTile] = useState<Exclude<PhotoTileState, 'ready'> | null>(
    null,
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!me) return null

  const currentAvatar = me.profile?.avatarUrl?.trim() || null

  const handleFile = async (picked: File | undefined) => {
    if (!picked) return
    const problem = validateAvatarFile(picked)
    if (problem) {
      setError(problem === 'type' ? t.wrongType : t.tooBig)
      return
    }

    setUploading(true)
    setError(null)
    // A HEIC this browser can't show becomes a JPEG first; if that fails
    // the original goes up and the API converts it.
    if (isHeicFile(picked)) setTile('converting')
    const { file, viewable } = await viewablePhoto(picked)
    setTile(viewable ? null : 'unavailable')
    const localPreview = viewable ? URL.createObjectURL(file) : null
    setPreviewUrl(localPreview)

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
      setTile(null)
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }

  return (
    // Form spacing (FE-481): the card is a title, its sentence and one field.
    // The sentence is `titleToSubtitle` (8) under the title and the field
    // `headerToBody` (24) under that (the card's `bodyGap`); the photo, the
    // button and the hint are the field's control, so the hint and a refused
    // file's reason sit `controlToHelper` (4) under it. The button is the
    // editor's main button: `controlHeight` (48).
    <Card
      layout="section"
      id="profile-photo"
      p={{ base: 5, md: 6 }}
      bodyGap="form.headerToBody"
    >
      <Stack gap="form.titleToSubtitle">
        <Heading size="md">{t.heading}</Heading>
        <Text fontSize="sm" color="text.muted">
          {t.body}
        </Text>
      </Stack>

      <Stack gap="form.controlToHelper">
        <HStack gap={4} align="center" flexWrap="wrap">
          {tile ? (
            <PhotoTile state={tile} alt={t.heading} size="96px" round />
          ) : (
            <MeAvatar
              size="xl"
              name={displayNameFromMe(me)}
              avatarUrl={previewUrl ?? currentAvatar}
              rootProps={{ opacity: uploading ? 0.6 : 1 }}
            />
          )}

          <Stack gap="form.controlToHelper">
            {/* The front camera, for a selfie. */}
            <PhotoSourcePicker
              camera="user"
              accept={AVATAR_ACCEPTED_TYPES.join(',')}
              onFiles={(files) => void handleFile(files[0])}
            >
              {(trigger) => (
                <Button
                  {...trigger}
                  size="form"
                  variant="secondary"
                  alignSelf="flex-start"
                  onClick={() => {
                    setError(null)
                    trigger.onClick()
                  }}
                  loading={uploading}
                >
                  {currentAvatar ? t.replace : t.upload}
                </Button>
              )}
            </PhotoSourcePicker>
            <Text fontSize="xs" lineHeight="16px" color="text.muted">
              {t.hint}
            </Text>
          </Stack>
        </HStack>

        {error ? (
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {error}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

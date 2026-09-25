'use client'

import { Image, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import { Modal } from '../../Modal/Modal'
import bag from '../i11n.json'

export type NotificationLandPopupProps = {
  open: boolean
  title: string
  body: string
  imageUrl?: string | null
  primaryLabel: string
  onPrimary: () => void
  onDismiss: () => void
  submitting?: boolean
}

/**
 * Dismissible land notice. The host must not mount this on map home (`/search`).
 */
export function NotificationLandPopup({
  open,
  title,
  body,
  imageUrl,
  primaryLabel,
  onPrimary,
  onDismiss,
  submitting = false,
}: NotificationLandPopupProps) {
  const t = useI11n(bag).notifications
  const image = imageUrl?.trim()

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
      title={title || t.popupLabel}
      size="sm"
      cancelLabel={t.dismiss}
      submitLabel={primaryLabel}
      submitLoading={submitting}
      submitDisabled={submitting}
      onCancel={onDismiss}
      onSubmit={onPrimary}
    >
      <Stack gap={3}>
        {image ? (
          <Image
            src={image}
            alt=""
            maxH="160px"
            w="full"
            objectFit="cover"
            borderRadius="lg"
            bg="bg.subtle"
          />
        ) : null}
        {body ? (
          <Text fontSize="sm" color="text.default" lineHeight="tall">
            {body}
          </Text>
        ) : null}
      </Stack>
    </Modal>
  )
}

'use client'

import { HStack, QrCode, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { FaApple, FaGooglePlay } from 'react-icons/fa'

import { useI11n } from '@/i18n/useI11n'
import { GET_APP_HREF } from '@/utils/appRoutes'

import { Modal } from '../Modal/Modal'
import bag from './i11n.json'

function StoreBadge({ icon, store }: { icon: ReactNode; store: string }) {
  const t = useI11n(bag)
  return (
    <HStack
      gap={2}
      px={3}
      py={2}
      borderRadius="lg"
      bg="text.default"
      color="bg.surface"
      minW="9.5rem"
      aria-disabled
    >
      <Text as="span" fontSize="2xl" lineHeight={1} aria-hidden>
        {icon}
      </Text>
      <Stack gap={0}>
        <Text fontSize="2xs" fontWeight={500} lineHeight="short">
          {t.comingSoon}
        </Text>
        <Text fontSize="md" fontWeight={500} lineHeight="short">
          {store}
        </Text>
      </Stack>
    </HStack>
  )
}

/**
 * "Get the Slashie app": coming soon to both stores. On a PC it adds a QR code
 * that opens slashie.app on a phone; on a phone (after the app didn't open)
 * the QR is left out.
 */
export function GetAppDialog({
  open,
  onOpenChange,
  showQr,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  showQr: boolean
}) {
  const t = useI11n(bag)
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t.title} size="sm">
      <Stack gap={5} align="center" textAlign="center">
        <Text color="text.muted" lineHeight="tall">
          {t.body}
        </Text>
        {showQr ? (
          <Stack gap={2} align="center">
            <QrCode.Root value={GET_APP_HREF} size="lg" aria-label={t.qrLabel}>
              <QrCode.Frame>
                <QrCode.Pattern />
              </QrCode.Frame>
            </QrCode.Root>
            <Text fontSize="sm" color="text.muted">
              {t.scan}
            </Text>
          </Stack>
        ) : null}
        <HStack gap={3} flexWrap="wrap" justify="center">
          <StoreBadge icon={<FaApple />} store={t.appStore} />
          <StoreBadge icon={<FaGooglePlay />} store={t.googlePlay} />
        </HStack>
      </Stack>
    </Modal>
  )
}

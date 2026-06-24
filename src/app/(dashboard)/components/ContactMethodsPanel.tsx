'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import {
  hasVerifiedContactMethod,
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Badge, Button } from '@ui'

import { EmailVerificationModal } from './EmailVerificationModal'
import { PhoneVerificationModal } from './PhoneVerificationModal'

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge variant={verified ? 'success' : 'gray'}>
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}

function EmailContactRow({
  onContactUpdated,
}: { onContactUpdated?: () => void }) {
  const me = useUserStore((s) => s.me)
  const [modalOpen, setModalOpen] = useState(false)

  if (!me) return null
  const verified = isEmailVerified(me)

  return (
    <>
      <Stack
        gap={3}
        borderBottomWidth="1px"
        borderColor="border.default"
        pb={4}
      >
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={0} minW={0}>
            <Text fontSize="sm" fontWeight={700} color="text.default">
              Email
            </Text>
            <Text fontSize="sm" color="text.muted">
              {me.email}
            </Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap">
            <VerifiedBadge verified={verified} />
            {!verified ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                Verify
              </Button>
            ) : null}
          </HStack>
        </HStack>
      </Stack>
      <EmailVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onContactUpdated={onContactUpdated}
      />
    </>
  )
}

export function PhoneContactRow({
  onContactUpdated,
}: { onContactUpdated?: () => void }) {
  const me = useUserStore((s) => s.me)
  const [modalOpen, setModalOpen] = useState(false)

  if (!me) return null

  const savedPhone = profileContactNumber(me)
  const verified = isPhoneVerified(me)
  const displayPhone = savedPhone
    ? formatPhoneForDisplay(savedPhone)
    : 'No number saved'

  return (
    <>
      <Stack gap={3}>
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={0} minW={0}>
            <Text fontSize="sm" fontWeight={700} color="text.default">
              Phone
            </Text>
            <Text fontSize="sm" color="text.muted">
              {displayPhone}
            </Text>
          </Stack>
          <HStack gap={3} flexWrap="wrap">
            {savedPhone ? <VerifiedBadge verified={verified} /> : null}
            {!verified ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setModalOpen(true)}
              >
                {savedPhone ? 'Verify' : 'Add phone'}
              </Button>
            ) : null}
          </HStack>
        </HStack>
      </Stack>
      <PhoneVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerified={onContactUpdated}
      />
    </>
  )
}

type ContactMethodsPanelProps = {
  compact?: boolean
  showIntro?: boolean
  onContactUpdated?: () => void
}

/** Account-level email and phone verification (`me.email`, `me.phoneVerified`). */
export function ContactMethodsPanel({
  showIntro = true,
  onContactUpdated,
}: ContactMethodsPanelProps) {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const ready = hasVerifiedContactMethod(me)

  return (
    <Stack gap={4}>
      {showIntro ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          Verify a contact method on your account so customers can trust your
          profile. Payment is arranged directly between you and the customer
          outside Slashie.
        </Text>
      ) : null}

      <EmailContactRow onContactUpdated={onContactUpdated} />
      <PhoneContactRow onContactUpdated={onContactUpdated} />

      {ready ? (
        <Text fontSize="sm" fontWeight={600} color="text.link">
          At least one contact method is verified. You can continue when ready.
        </Text>
      ) : (
        <Text fontSize="sm" color="text.muted">
          Verify your email or phone to continue.
        </Text>
      )}
    </Stack>
  )
}

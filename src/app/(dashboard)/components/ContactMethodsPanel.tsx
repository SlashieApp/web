'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import {
  hasVerifiedContactMethod,
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import { Badge, Button } from '@ui'

import { PhoneContactEditor } from './PhoneContactEditor'

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      bg={verified ? 'primary.100' : 'badgeBg'}
      color={verified ? 'primary.800' : 'cardFg'}
    >
      {verified ? 'Verified' : 'Unverified'}
    </Badge>
  )
}

function EmailContactRow({
  onContactUpdated,
}: { onContactUpdated?: () => void }) {
  const me = useUserStore((s) => s.me)
  const { resend, isSending, message, isSent } = useResendVerificationEmail()

  if (!me) return null
  const verified = isEmailVerified(me)

  const handleResend = async () => {
    await resend()
    onContactUpdated?.()
  }

  return (
    <Stack gap={3} borderBottomWidth="1px" borderColor="cardBorder" pb={4}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        flexWrap="wrap"
      >
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={700} color="cardFg">
            Email
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            {me.email}
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          <VerifiedBadge verified={verified} />
          {!verified ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                loading={isSending}
                onClick={() => void handleResend()}
              >
                Resend verification email
              </Button>
              <Link
                as={NextLink}
                href="/verify-email/sent"
                fontSize="sm"
                fontWeight={600}
                color="primary.600"
                _hover={{ textDecoration: 'none', color: 'primary.700' }}
              >
                Check inbox
              </Link>
            </>
          ) : null}
        </HStack>
      </HStack>

      {!verified && message ? (
        <Text fontSize="sm" color={isSent ? 'primary.700' : 'red.500'}>
          {message}
        </Text>
      ) : null}

      {!verified ? (
        <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
          Verification confirms the email on your account ({me.email}). Open the
          link in your inbox — you cannot verify a different address.
        </Text>
      ) : null}
    </Stack>
  )
}

function PhoneContactRow({
  compact,
  onContactUpdated,
}: {
  compact?: boolean
  onContactUpdated?: () => void
}) {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const savedPhone = profileContactNumber(me)
  const verified = isPhoneVerified(me)

  return (
    <Stack gap={3}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        flexWrap="wrap"
      >
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={700} color="cardFg">
            Phone
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            Save your number, then verify by SMS.
          </Text>
        </Stack>
        {savedPhone ? <VerifiedBadge verified={verified} /> : null}
      </HStack>

      <PhoneContactEditor
        compact={compact}
        onContactUpdated={onContactUpdated}
      />
    </Stack>
  )
}

type ContactMethodsPanelProps = {
  compact?: boolean
  showIntro?: boolean
  /** Called after a contact method is verified or saved. */
  onContactUpdated?: () => void
}

/** Account-level email and phone verification (`me.email`, `me.phoneVerified`). */
export function ContactMethodsPanel({
  compact = false,
  showIntro = true,
  onContactUpdated,
}: ContactMethodsPanelProps) {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const ready = hasVerifiedContactMethod(me)

  return (
    <Stack gap={4}>
      {showIntro ? (
        <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
          Verify a contact method on your account so customers can trust your
          profile. Payment is arranged directly between you and the customer
          outside Slashie.
        </Text>
      ) : null}

      <EmailContactRow onContactUpdated={onContactUpdated} />
      <PhoneContactRow compact={compact} onContactUpdated={onContactUpdated} />

      {ready ? (
        <Text fontSize="sm" fontWeight={600} color="primary.700">
          At least one contact method is verified. You can continue when ready.
        </Text>
      ) : (
        <Text fontSize="sm" color="formLabelMuted">
          Verify your email or phone to continue.
        </Text>
      )}
    </Stack>
  )
}

'use client'

import { HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import {
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import { PhoneContactEditor } from '@/app/(dashboard)/components/PhoneContactEditor'
import { Badge, Button, SectionCard } from '@ui'

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

function EmailRow() {
  const me = useUserStore((s) => s.me)
  const { resend, isSending, message, isSent } = useResendVerificationEmail()

  if (!me) return null
  const verified = isEmailVerified(me)

  return (
    <Stack gap={3} borderBottomWidth="1px" borderColor="cardBorder" pb={4}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={3}
        flexWrap="wrap"
      >
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={700}>
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
                onClick={() => void resend()}
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
        <Text fontSize="sm" color="formLabelMuted">
          Verification confirms the email on your account ({me.email}). Open the
          link in your inbox — you cannot verify a different address.
        </Text>
      ) : null}
    </Stack>
  )
}

function PhoneRow() {
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
          <Text fontSize="sm" fontWeight={700}>
            Phone
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            Save your number, then verify by SMS.
          </Text>
        </Stack>
        {savedPhone ? <VerifiedBadge verified={verified} /> : null}
      </HStack>

      <PhoneContactEditor compact />
    </Stack>
  )
}

export function AccountContactCard() {
  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">Contact methods</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Verify a contact method to unlock it as a default on your profile
            and to become a worker.
          </Text>
        </Stack>
        <EmailRow />
        <PhoneRow />
      </Stack>
    </SectionCard>
  )
}

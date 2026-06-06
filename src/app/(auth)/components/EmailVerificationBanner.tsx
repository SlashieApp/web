'use client'

import { Box, HStack, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { Button } from '@ui'

export function EmailVerificationBanner() {
  const me = useMe()
  const { resend, isSending, message } = useResendVerificationEmail()

  if (!me || isEmailVerified(me)) return null

  return (
    <Box
      bg="primary.50"
      borderBottomWidth="1px"
      borderColor="primary.200"
      px={{ base: 3, lg: 4 }}
      py={2}
    >
      <HStack
        gap={3}
        justify="space-between"
        flexWrap="wrap"
        align="center"
        maxW="full"
      >
        <Text fontSize="sm" color="primary.800" fontWeight={600}>
          Verify your email to post tasks and send quotes.
        </Text>
        <HStack gap={2} flexWrap="wrap" align="center">
          {message ? (
            <Text fontSize="xs" color="primary.700">
              {message}
            </Text>
          ) : null}
          <Link
            as={NextLink}
            href="/verify-email/sent"
            fontSize="sm"
            fontWeight={700}
            color="primary.700"
            _hover={{ color: 'primary.800', textDecoration: 'none' }}
          >
            Check inbox
          </Link>
          <Button
            size="xs"
            variant="secondary"
            loading={isSending}
            onClick={() => void resend()}
          >
            Resend email
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

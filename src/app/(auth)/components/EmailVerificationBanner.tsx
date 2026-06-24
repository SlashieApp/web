'use client'

import { Box, HStack, Text } from '@chakra-ui/react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { Button, Link } from '@ui'

export function EmailVerificationBanner() {
  const me = useMe()
  const { resend, isSending, message } = useResendVerificationEmail()

  if (!me || isEmailVerified(me)) return null

  return (
    <Box
      bg="status.success.soft"
      borderBottomWidth="1px"
      borderColor="green.200"
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
        <Text fontSize="sm" color="status.success.fg" fontWeight={600}>
          Verify your email to post tasks and send quotes.
        </Text>
        <HStack gap={2} flexWrap="wrap" align="center">
          {message ? (
            <Text fontSize="xs" color="status.success.fg">
              {message}
            </Text>
          ) : null}
          <Link
            href="/verify-email/sent"
            fontSize="sm"
            fontWeight={700}
            color="text.link"
            _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
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

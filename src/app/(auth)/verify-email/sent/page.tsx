'use client'

import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Button, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useRef } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'

function VerifyEmailSentFallback() {
  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="formLabelMuted">Loading…</Text>
    </Box>
  )
}

function VerifyEmailSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const me = useMe()
  const { resend, isSending, message, isSent } = useResendVerificationEmail()

  const nextPath = useMemo(() => {
    const next = searchParams.get('next')?.trim() ?? ''
    if (next.startsWith('/') && !next.startsWith('//')) return next
    return null
  }, [searchParams])

  const isLoggedIn = Boolean(getAuthToken())
  const redirectedRef = useRef(false)

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current) return
      if (me && isEmailVerified(me)) {
        redirectedRef.current = true
        router.replace(nextPath ?? '/dashboard')
      }
    },
    [me, nextPath, router],
  )

  if (me && isEmailVerified(me)) {
    return (
      <Text color="formLabelMuted" fontSize="sm">
        Redirecting…
      </Text>
    )
  }

  return (
    <Stack ref={onMountRef} gap={6} w="full">
      <Link
        as={NextLink}
        href="/"
        display="block"
        w="full"
        _hover={{ textDecoration: 'none', opacity: 0.92 }}
      >
        <Logo h="48px" />
      </Link>

      <Box
        w="full"
        bg="neutral.100"
        borderRadius="2xl"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
      >
        <Stack gap={5} align="center" textAlign="center">
          <Heading size="xl" color="cardFg">
            Check your inbox
          </Heading>
          <Text color="formLabelMuted" fontSize="sm" lineHeight="1.6">
            We sent a verification link to{' '}
            {me?.email ? (
              <Text as="span" fontWeight={700} color="cardFg">
                {me.email}
              </Text>
            ) : (
              'your email address'
            )}
            . Open the link to verify your account — you can keep browsing while
            you wait.
          </Text>

          {isLoggedIn ? (
            <Stack gap={3} w="full" maxW="xs">
              <Button
                loading={isSending}
                onClick={() => void resend()}
                w="full"
              >
                Resend verification email
              </Button>
              {message ? (
                <Box
                  as="output"
                  fontSize="sm"
                  color={isSent ? 'primary.700' : 'red.500'}
                >
                  {message}
                </Box>
              ) : null}
              <Link
                as={NextLink}
                href={nextPath ?? '/dashboard'}
                fontSize="sm"
                fontWeight={600}
                color="primary.600"
                _hover={{ textDecoration: 'none', color: 'primary.700' }}
              >
                Continue to dashboard
              </Link>
            </Stack>
          ) : (
            <Stack gap={2}>
              <Text fontSize="sm" color="formLabelMuted">
                Log in to resend the verification email.
              </Text>
              <Link
                as={NextLink}
                href={`/login?next=${encodeURIComponent('/verify-email/sent')}`}
                _hover={{ textDecoration: 'none' }}
              >
                <Button w="full">Log in</Button>
              </Link>
            </Stack>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<VerifyEmailSentFallback />}>
      <VerifyEmailSentContent />
    </Suspense>
  )
}

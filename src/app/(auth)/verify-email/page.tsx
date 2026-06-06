'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { VerifyEmailMutation } from '@codegen/schema'
import { Button, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useRef, useState } from 'react'

import {
  isEmailMismatchError,
  isInvalidOrExpiredVerificationError,
} from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import VerifyEmail from '@/app/(auth)/verify-email/graphql/VerifyEmail.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/lib/analytics'
import { getAuthToken, setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type VerifyState = 'loading' | 'success' | 'error' | 'invalid-link'

function VerifyEmailFallback() {
  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="formLabelMuted">Loading…</Text>
    </Box>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getUser = useUserStore((s) => s.getUser)
  const tokenFromUrl = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  )
  const nextPath = useMemo(() => {
    const next = searchParams.get('next')?.trim() ?? ''
    if (next.startsWith('/') && !next.startsWith('//')) return next
    return '/dashboard'
  }, [searchParams])

  const [state, setState] = useState<VerifyState>(() =>
    tokenFromUrl ? 'loading' : 'invalid-link',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startedRef = useRef(false)

  const [verifyEmail] = useMutation<VerifyEmailMutation>(VerifyEmail)
  const {
    resend,
    isSending,
    message: resendMessage,
  } = useResendVerificationEmail()

  const runVerify = useCallback(async () => {
    if (!tokenFromUrl) {
      setState('invalid-link')
      return
    }

    setState('loading')
    setErrorMessage(null)

    try {
      const result = await verifyEmail({ variables: { token: tokenFromUrl } })
      const authToken = result.data?.verifyEmail?.token?.trim()
      if (!authToken) {
        throw new Error(
          'Verification succeeded but no session token was returned.',
        )
      }

      setAuthToken(authToken)
      await getUser()
      trackFlowSucceeded(EVENTS.email_verify_succeeded)
      setState('success')
      router.replace(nextPath)
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.email_verify_failed, error, {
        flow: 'email_verify',
        action: 'verifyEmail',
        operation: 'VerifyEmail',
        route: '/verify-email',
      })
      if (
        isInvalidOrExpiredVerificationError(error) ||
        isEmailMismatchError(error)
      ) {
        setState('error')
        setErrorMessage(
          getFriendlyErrorMessage(
            error,
            'This verification link is invalid or has expired.',
          ),
        )
        return
      }
      setState('error')
      setErrorMessage(
        getFriendlyErrorMessage(error, 'Could not verify your email.'),
      )
    }
  }, [getUser, nextPath, router, tokenFromUrl, verifyEmail])

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || startedRef.current || !tokenFromUrl) return
      startedRef.current = true
      void runVerify()
    },
    [runVerify, tokenFromUrl],
  )

  const isLoggedIn = Boolean(getAuthToken())

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
          {state === 'loading' ? (
            <>
              <Heading size="xl" color="cardFg">
                Verifying your email…
              </Heading>
              <Text color="formLabelMuted" fontSize="sm">
                Hang tight while we confirm your link.
              </Text>
            </>
          ) : null}

          {state === 'success' ? (
            <>
              <Heading size="xl" color="cardFg">
                Email verified
              </Heading>
              <Text color="formLabelMuted" fontSize="sm">
                Redirecting you now…
              </Text>
            </>
          ) : null}

          {state === 'invalid-link' ? (
            <>
              <Heading size="xl" color="cardFg">
                Invalid link
              </Heading>
              <Text color="formLabelMuted" fontSize="sm">
                This verification link is missing or malformed. Open the link
                from your email, or request a new one.
              </Text>
              {isLoggedIn ? (
                <Button
                  variant="secondary"
                  loading={isSending}
                  onClick={() => void resend()}
                >
                  Resend verification email
                </Button>
              ) : (
                <Link
                  as={NextLink}
                  href="/login"
                  fontWeight={700}
                  color="primary.600"
                  _hover={{ textDecoration: 'none', color: 'primary.700' }}
                >
                  Log in to resend
                </Link>
              )}
            </>
          ) : null}

          {state === 'error' ? (
            <>
              <Heading size="xl" color="cardFg">
                Link expired or invalid
              </Heading>
              <Text color="formLabelMuted" fontSize="sm">
                {errorMessage ??
                  'This verification link is invalid or has expired.'}
              </Text>
              {isLoggedIn ? (
                <Stack gap={2} w="full" maxW="xs">
                  <Button
                    loading={isSending}
                    onClick={() => void resend()}
                    w="full"
                  >
                    Resend verification email
                  </Button>
                  <Link
                    as={NextLink}
                    href="/verify-email/sent"
                    fontSize="sm"
                    fontWeight={600}
                    color="primary.600"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Go to check-inbox page
                  </Link>
                </Stack>
              ) : (
                <Link
                  as={NextLink}
                  href={`/login?next=${encodeURIComponent('/verify-email/sent')}`}
                  fontWeight={700}
                  color="primary.600"
                  _hover={{ textDecoration: 'none', color: 'primary.700' }}
                >
                  Log in to resend
                </Link>
              )}
            </>
          ) : null}

          {resendMessage && state !== 'loading' ? (
            <Text fontSize="sm" color="primary.700">
              {resendMessage}
            </Text>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

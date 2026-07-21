'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Button, Link, Logo } from '@ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'

import { TurnstileField } from '@/app/(auth)/components/TurnstileField'
import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'

export function ForgotPasswordSentPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = useMemo(
    () => searchParams.get('email')?.trim() ?? '',
    [searchParams],
  )
  const captcha = useProgressiveCaptcha({ alwaysRequire: true })

  const { requestReset, loading, message, cooldownSeconds, canResend } =
    useForgotPassword()

  const redirectedRef = useRef(false)
  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current || email) return
      redirectedRef.current = true
      router.replace('/forgot-password')
    },
    [email, router],
  )

  async function onResend() {
    if (captcha.requiresCaptcha && !captcha.token) return
    const result = await requestReset(email, {
      captchaToken: captcha.token,
    })
    captcha.resetChallenge()
    if (!result) return
  }

  if (!email) {
    return (
      <Box
        ref={onMountRef}
        minH="40vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.muted" fontSize="sm">
          Redirecting…
        </Text>
      </Box>
    )
  }

  const resendDisabled =
    !canResend || (captcha.requiresCaptcha && !captcha.token)

  return (
    <Stack gap={6} w="full">
      <Link
        href="/"
        display="block"
        w="full"
        _hover={{ textDecoration: 'none', opacity: 0.92 }}
      >
        <Logo h="48px" />
      </Link>

      <Box
        w="full"
        bg="bg.subtle"
        borderRadius="2xl"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
      >
        <Stack gap={5} align="center" textAlign="center">
          <Heading size="xl" color="text.default">
            Check your inbox
          </Heading>
          <Text color="text.muted" fontSize="sm" lineHeight="1.6">
            If an account exists for{' '}
            <Text as="span" fontWeight={700} color="text.default">
              {email}
            </Text>
            , we sent a password reset link. Open the link to choose a new
            password — the link expires in 1 hour.
          </Text>

          <Stack gap={3} w="full" maxW="xs" textAlign="left">
            {captcha.requiresCaptcha ? (
              <TurnstileField
                onTokenChange={captcha.setToken}
                resetSignal={captcha.resetSignal}
              />
            ) : null}

            <Button
              loading={loading}
              disabled={resendDisabled}
              onClick={() => void onResend()}
              w="full"
            >
              {cooldownSeconds > 0
                ? `Resend in ${cooldownSeconds}s`
                : 'Resend reset link'}
            </Button>

            {message ? (
              <Box
                as="output"
                fontSize="sm"
                color={
                  message.startsWith('Please wait') ||
                  message.startsWith('Too many') ||
                  message.startsWith('Security check')
                    ? 'status.danger.fg'
                    : 'status.success.fg'
                }
              >
                {message}
              </Box>
            ) : null}

            <Link
              href="/login"
              fontSize="sm"
              fontWeight={600}
              color="text.link"
              _hover={{ textDecoration: 'none', color: 'status.success.fg' }}
            >
              Back to sign in
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Button, FormField, Input, Link, Logo } from '@ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { TurnstileField } from '@/app/(auth)/components/TurnstileField'
import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'

import {
  FieldIconMail,
  IconArrowRight,
  IconLockReset,
} from './ForgotPasswordIcons'

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = useMemo(
    () => searchParams.get('email')?.trim() ?? '',
    [searchParams],
  )
  const [email, setEmail] = useState(initialEmail)
  const captcha = useProgressiveCaptcha({ alwaysRequire: true })

  const { requestReset, loading, message, cooldownSeconds, canResend } =
    useForgotPassword()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (captcha.requiresCaptcha && !captcha.token) {
      return
    }

    const result = await requestReset(email, {
      captchaToken: captcha.token,
    })
    if (!result) {
      captcha.resetChallenge()
      return
    }
    if (result.rateLimited) {
      captcha.resetChallenge()
      return
    }

    router.push(
      `/forgot-password/sent?email=${encodeURIComponent(email.trim())}`,
    )
  }

  const submitDisabled =
    !canResend || !email.trim() || (captcha.requiresCaptcha && !captcha.token)

  return (
    <Stack gap={6} w="full">
      <Link href="/" _hover={{ textDecoration: 'none', opacity: 0.92 }}>
        <Logo h="48px" />
      </Link>

      <Box
        w="full"
        bg="bg.subtle"
        borderRadius="xl"
        boxShadow="card"
        borderTopWidth="4px"
        borderTopColor="action.primary"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
      >
        <Stack gap={6} align="center" textAlign="center">
          <Box
            boxSize={14}
            borderRadius="full"
            bg="status.success.soft"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconLockReset />
          </Box>

          <Box>
            <Heading size="xl" color="text.default">
              Forgot Password?
            </Heading>
            <Text mt={2} color="text.muted" fontSize="sm" maxW="xs" mx="auto">
              Enter your email and we&apos;ll send reset instructions if an
              account exists.
            </Text>
          </Box>

          <Box as="form" onSubmit={onSubmit} w="full" textAlign="left">
            <Stack gap={4}>
              <FormField label="Email Address">
                <Input
                  startElement={<FieldIconMail />}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  type="email"
                  autoComplete="email"
                  required
                  rootProps={{ minH: '48px', w: 'full' }}
                />
              </FormField>

              {captcha.requiresCaptcha ? (
                <TurnstileField
                  onTokenChange={captcha.setToken}
                  resetSignal={captcha.resetSignal}
                />
              ) : null}

              {message ? (
                <Text role="alert" color="status.danger.fg" fontSize="sm">
                  {message}
                </Text>
              ) : null}

              <Button
                type="submit"
                loading={loading}
                disabled={submitDisabled}
                w="full"
                borderRadius="full"
                size="lg"
              >
                {cooldownSeconds > 0
                  ? `Send again in ${cooldownSeconds}s`
                  : 'Send Reset Link'}
                <IconArrowRight />
              </Button>
            </Stack>
          </Box>

          <Link
            href="/login"
            fontSize="sm"
            fontWeight={700}
            color="text.link"
            _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
          >
            ← Back to Login
          </Link>
        </Stack>
      </Box>

      <Text fontSize="sm" color="text.muted" textAlign="center">
        Facing issues?{' '}
        <Link
          href="/"
          fontWeight={700}
          color="text.link"
          _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
        >
          Contact Support
        </Link>
      </Text>
    </Stack>
  )
}

'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Button, Link, Logo } from '@ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'

import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'

export function ForgotPasswordSentPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = useMemo(
    () => searchParams.get('email')?.trim() ?? '',
    [searchParams],
  )

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

  if (!email) {
    return (
      <Box
        ref={onMountRef}
        minH="40vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="formLabelMuted" fontSize="sm">
          Redirecting…
        </Text>
      </Box>
    )
  }

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
            If an account exists for{' '}
            <Text as="span" fontWeight={700} color="cardFg">
              {email}
            </Text>
            , we sent a password reset link. Open the link to choose a new
            password — the link expires in 1 hour.
          </Text>

          <Stack gap={3} w="full" maxW="xs">
            <Button
              loading={loading}
              disabled={!canResend}
              onClick={() => void requestReset(email)}
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
                  message.startsWith('Please wait') ? 'red.500' : 'primary.700'
                }
              >
                {message}
              </Box>
            ) : null}

            <Link
              href="/login"
              fontSize="sm"
              fontWeight={600}
              color="primary.600"
              _hover={{ textDecoration: 'none', color: 'primary.700' }}
            >
              Back to sign in
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

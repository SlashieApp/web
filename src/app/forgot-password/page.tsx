'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Link, Stack } from '@chakra-ui/react'
import type { ForgotPasswordMutation } from '@codegen/schema'
import { Button, FormField, HandyBoxWordmark, Heading, Input, Text } from '@ui'
import NextLink from 'next/link'
import { useState } from 'react'

import { FORGOT_PASSWORD_MUTATION } from '@/graphql/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

function FieldIconMail() {
  return (
    <Box as="span" color="muted" display="flex" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Email</title>
        <path
          d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconLockReset() {
  return (
    <Box color="primary.700" display="flex" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <title>Reset password</title>
        <path
          d="M12 3a6 6 0 0 0-6 6v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V9a6 6 0 0 0-6-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.5a3.5 3.5 0 1 0-7 0V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17 8V5M17 5h3M17 5h-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function IconArrowRight() {
  return (
    <Box as="span" display="inline-flex" ml={1.5} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Continue</title>
        <path
          d="M5 12h14m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const [forgotPassword, { loading }] = useMutation<ForgotPasswordMutation>(
    FORGOT_PASSWORD_MUTATION,
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setResetToken(null)

    try {
      const res = await forgotPassword({
        variables: { email },
      })
      const payload = res.data?.forgotPassword
      if (!payload?.success) {
        throw new Error('Could not start password reset. Please try again.')
      }

      setSuccessMessage(
        'If an account exists for this email, a password reset link has been sent.',
      )
      setResetToken(payload.resetToken ?? null)
    } catch (err: unknown) {
      setError(
        getFriendlyErrorMessage(err, 'Could not start password reset process.'),
      )
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={{ base: 10, md: 14 }}
      bg="linear-gradient(180deg, #f0f4ff 0%, #f8f9ff 45%, #eef2fb 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage="radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26, 86, 219, 0.12), transparent 55%)"
        pointerEvents="none"
        aria-hidden
      />

      <Stack
        gap={8}
        align="center"
        position="relative"
        zIndex={1}
        w="full"
        maxW="md"
      >
        <Link
          as={NextLink}
          href="/"
          _hover={{ textDecoration: 'none', opacity: 0.92 }}
        >
          <HandyBoxWordmark size="lg" />
        </Link>

        <Box
          w="full"
          bg="surfaceContainerLowest"
          borderRadius="xl"
          boxShadow="card"
          borderTopWidth="4px"
          borderTopColor="primary.500"
          px={{ base: 6, md: 10 }}
          py={{ base: 8, md: 10 }}
        >
          <Stack gap={6} align="center" textAlign="center">
            <Box
              boxSize={14}
              borderRadius="full"
              bg="primary.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <IconLockReset />
            </Box>

            <Box>
              <Heading size="xl" color="fg">
                Forgot Password?
              </Heading>
              <Text mt={2} color="muted" fontSize="sm" maxW="xs" mx="auto">
                No worries, we&apos;ll send you reset instructions.
              </Text>
            </Box>

            <Box as="form" onSubmit={onSubmit} w="full" textAlign="left">
              <Stack gap={4}>
                <FormField label="Email Address">
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left={3}
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={1}
                      pointerEvents="none"
                    >
                      <FieldIconMail />
                    </Box>
                    <Input
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      pl={10}
                      borderRadius="full"
                      bg="primary.50"
                      borderWidth="0"
                      boxShadow="none"
                      _focusVisible={{
                        boxShadow:
                          'inset 0 0 0 2px rgba(26, 86, 219, 0.35), 0 0 0 3px rgba(26, 86, 219, 0.12)',
                      }}
                    />
                  </Box>
                </FormField>

                {error ? (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                ) : null}
                {successMessage ? (
                  <Text color="green.600" fontSize="sm">
                    {successMessage}
                  </Text>
                ) : null}
                {resetToken ? (
                  <Text color="mustard.600" fontSize="sm">
                    Dev reset token: {resetToken}
                  </Text>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  w="full"
                  borderRadius="full"
                  size="lg"
                >
                  Send Reset Link
                  <IconArrowRight />
                </Button>
              </Stack>
            </Box>

            <Link
              as={NextLink}
              href="/login"
              fontSize="sm"
              fontWeight={700}
              color="primary.600"
              _hover={{ color: 'primary.700', textDecoration: 'none' }}
            >
              ← Back to Login
            </Link>
          </Stack>
        </Box>

        <Text fontSize="sm" color="muted" textAlign="center">
          Facing issues?{' '}
          <Link
            as={NextLink}
            href="/tasks"
            fontWeight={700}
            color="secondary.600"
            _hover={{ color: 'secondary.700', textDecoration: 'none' }}
          >
            Contact Support
          </Link>
        </Text>
      </Stack>
    </Box>
  )
}

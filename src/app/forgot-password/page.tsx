'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { ForgotPasswordMutation } from '@codegen/schema'
import { Button, Container, Input } from '@ui'
import NextLink from 'next/link'
import { useState } from 'react'

import { LandingHeader } from '@/app/components'
import { FORGOT_PASSWORD_MUTATION } from '@/graphql/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

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
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }}>
      <Container>
        <Stack gap={10}>
          <LandingHeader />
          <Box maxW="md">
            <Stack gap={6}>
              <Box>
                <Heading size="lg">Forgot your password?</Heading>
                <Text opacity={0.8} mt={2}>
                  Enter your email and we will help you reset your password.
                </Text>
              </Box>

              <Box as="form" onSubmit={onSubmit}>
                <Stack gap={3}>
                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                  />

                  {error ? (
                    <Text color="red.400" fontSize="sm">
                      {error}
                    </Text>
                  ) : null}
                  {successMessage ? (
                    <Text color="green.400" fontSize="sm">
                      {successMessage}
                    </Text>
                  ) : null}
                  {resetToken ? (
                    <Text color="mustard.500" fontSize="sm">
                      Dev reset token: {resetToken}
                    </Text>
                  ) : null}

                  <Button type="submit" loading={loading}>
                    Send reset link
                  </Button>
                </Stack>
              </Box>

              <Text fontSize="sm" opacity={0.85}>
                Already have your password?{' '}
                <Link as={NextLink} href="/login" textDecoration="underline">
                  Log in
                </Link>
              </Text>
              <Text fontSize="sm" opacity={0.85}>
                Have a reset token?{' '}
                <Link
                  as={NextLink}
                  href="/reset-password"
                  textDecoration="underline"
                >
                  Reset password
                </Link>
              </Text>
              <Link
                as={NextLink}
                href="/"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                ← Back to home
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

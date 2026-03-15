'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Button, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { ResetPasswordMutation } from '@codegen/schema'
import { Container, Input } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LandingHeader } from '@/app/components'
import { RESET_PASSWORD_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [resetPassword, { loading }] = useMutation<ResetPasswordMutation>(
    RESET_PASSWORD_MUTATION,
  )

  useEffect(() => {
    const resetToken = new URLSearchParams(window.location.search).get('token')
    if (resetToken) {
      setToken(resetToken)
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError('Reset token is required.')
      return
    }

    try {
      const res = await resetPassword({
        variables: { token: token.trim(), newPassword },
      })

      const authToken = res.data?.resetPassword?.token
      if (!authToken) {
        throw new Error(
          'Password reset succeeded but no session token was returned.',
        )
      }

      setAuthToken(authToken)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Could not reset password.'))
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
                <Heading size="lg">Reset password</Heading>
                <Text opacity={0.8} mt={2}>
                  Enter the reset token and your new password.
                </Text>
              </Box>

              <Box as="form" onSubmit={onSubmit}>
                <Stack gap={3}>
                  <Input
                    placeholder="Reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    required
                  />

                  {error ? (
                    <Text color="red.400" fontSize="sm">
                      {error}
                    </Text>
                  ) : null}

                  <Button type="submit" loading={loading} colorPalette="blue">
                    Reset password
                  </Button>
                </Stack>
              </Box>

              <Text fontSize="sm" opacity={0.85}>
                Need a reset token?{' '}
                <Link
                  as={NextLink}
                  href="/forgot-password"
                  textDecoration="underline"
                >
                  Request reset email
                </Link>
              </Text>
              <Link
                as={NextLink}
                href="/login"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                ← Back to log in
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, IconButton, Link, Stack } from '@chakra-ui/react'
import type { ResetPasswordMutation } from '@codegen/schema'
import { Button, FormField, Heading, Input, Text } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { RESET_PASSWORD_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

function IconLockReset() {
  return (
    <Box color="primary.700" display="flex" aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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

function IconEye({ open }: { open: boolean }) {
  return (
    <Box as="span" display="flex" color="muted" aria-hidden>
      {open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <title>Show password</title>
          <path
            d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <title>Hide password</title>
          <path
            d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c5.5 0 9 6 9 6a18.5 18.5 0 0 1-4.8 5.2M6.3 6.3A18.1 18.1 0 0 0 3 12s3.5 6 9 6a9.7 9.7 0 0 0 4.1-.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Box>
  )
}

function PasswordToggleButton({
  visible,
  onToggle,
  label,
}: {
  visible: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-label={label}
      minW="var(--input-height)"
      h="var(--input-height)"
      borderRadius="md"
      color="muted"
      _hover={{ bg: 'rgba(0, 63, 177, 0.06)' }}
    >
      <IconEye open={!visible} />
    </IconButton>
  )
}

function ReqRow({
  met,
  children,
}: {
  met: boolean
  children: ReactNode
}) {
  return (
    <HStack gap={2.5} align="center">
      <Box
        boxSize={5}
        borderRadius="full"
        borderWidth="1.5px"
        borderColor={met ? 'primary.500' : 'outlineVariant'}
        bg={met ? 'primary.500' : 'transparent'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {met ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <title>Requirement met</title>
            <path
              d="M20 6 9 17l-5-5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </Box>
      <Text fontSize="sm" fontWeight={500} color={met ? 'fg' : 'muted'}>
        {children}
      </Text>
    </HStack>
  )
}

function IconShieldSmall() {
  return (
    <Box color="muted" display="flex" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <title>Security</title>
        <path
          d="M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [showTokenField, setShowTokenField] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

  const hasMinLength = newPassword.length >= 8
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/.test(
    newPassword,
  )
  const hasUppercase = /[A-Z]/.test(newPassword)

  const passwordMeetsRules = useMemo(
    () => hasMinLength && hasNumberOrSymbol && hasUppercase,
    [hasMinLength, hasNumberOrSymbol, hasUppercase],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError('Reset token is required.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!passwordMeetsRules) {
      setError('Please meet all password requirements below.')
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
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={{ base: 10, md: 14 }}
      bg="linear-gradient(180deg, #e8f0ff 0%, #f4f7fd 50%, #eef2fb 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        right="-8%"
        bottom="-12%"
        fontSize="clamp(8rem, 22vw, 14rem)"
        fontWeight={800}
        color="primary.500"
        opacity={0.04}
        lineHeight={1}
        pointerEvents="none"
        userSelect="none"
        aria-hidden
      >
        HB
      </Box>

      <Stack
        gap={6}
        align="center"
        position="relative"
        zIndex={1}
        w="full"
        maxW="md"
      >
        <Box
          w="full"
          bg="surfaceContainerLowest"
          borderRadius="2xl"
          boxShadow="ambient"
          px={{ base: 6, md: 10 }}
          py={{ base: 8, md: 10 }}
        >
          <Stack gap={6} align="center" textAlign="center">
            <Box
              boxSize={12}
              borderRadius="lg"
              bg="primary.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <IconLockReset />
            </Box>

            <Box>
              <Heading size="xl" color="fg">
                Reset Password
              </Heading>
              <Text mt={2} color="muted" fontSize="sm">
                Create a new, strong password for your account.
              </Text>
            </Box>

            <Box as="form" onSubmit={onSubmit} w="full" textAlign="left">
              <Stack gap={4}>
                {(showTokenField || !token) && (
                  <FormField label="Reset token">
                    <Input
                      placeholder="Paste token from your email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      borderRadius="lg"
                      bg="primary.50"
                      borderWidth="0"
                      boxShadow="none"
                      _focusVisible={{
                        boxShadow:
                          'inset 0 0 0 2px rgba(26, 86, 219, 0.3), 0 0 0 3px rgba(26, 86, 219, 0.1)',
                      }}
                    />
                  </FormField>
                )}

                {token && !showTokenField ? (
                  <Text fontSize="xs" color="muted" textAlign="center">
                    <Box
                      asChild
                      display="inline"
                      fontWeight={600}
                      color="primary.600"
                      _hover={{ color: 'primary.700' }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowTokenField(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          font: 'inherit',
                          color: 'inherit',
                        }}
                      >
                        Enter or edit reset token
                      </button>
                    </Box>
                  </Text>
                ) : null}

                <FormField label="New Password">
                  <Box position="relative">
                    <Input
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      pr={12}
                      borderRadius="lg"
                      bg="primary.50"
                      borderWidth="0"
                      boxShadow="none"
                      _focusVisible={{
                        boxShadow:
                          'inset 0 0 0 2px rgba(26, 86, 219, 0.3), 0 0 0 3px rgba(26, 86, 219, 0.1)',
                      }}
                    />
                    <Box position="absolute" right={1} top={0}>
                      <PasswordToggleButton
                        visible={showNew}
                        onToggle={() => setShowNew((v) => !v)}
                        label={showNew ? 'Hide password' : 'Show password'}
                      />
                    </Box>
                  </Box>
                </FormField>

                <FormField label="Confirm New Password">
                  <Box position="relative">
                    <Input
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      pr={12}
                      borderRadius="lg"
                      bg="primary.50"
                      borderWidth="0"
                      boxShadow="none"
                      _focusVisible={{
                        boxShadow:
                          'inset 0 0 0 2px rgba(26, 86, 219, 0.3), 0 0 0 3px rgba(26, 86, 219, 0.1)',
                      }}
                    />
                    <Box position="absolute" right={1} top={0}>
                      <PasswordToggleButton
                        visible={showConfirm}
                        onToggle={() => setShowConfirm((v) => !v)}
                        label={
                          showConfirm
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                      />
                    </Box>
                  </Box>
                </FormField>

                <Stack
                  gap={2.5}
                  p={4}
                  borderRadius="lg"
                  bg="primary.100"
                  w="full"
                >
                  <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.12em"
                    color="muted"
                    textTransform="uppercase"
                  >
                    Security standards
                  </Text>
                  <ReqRow met={hasMinLength}>8+ characters required</ReqRow>
                  <ReqRow met={hasNumberOrSymbol}>
                    Include a number or symbol
                  </ReqRow>
                  <ReqRow met={hasUppercase}>One uppercase letter</ReqRow>
                </Stack>

                {error ? (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  w="full"
                  borderRadius="lg"
                  size="lg"
                >
                  Update Password
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
              ← Back to Sign In
            </Link>
          </Stack>
        </Box>

        <HStack gap={2} color="muted" justify="center">
          <IconShieldSmall />
          <IconShieldSmall />
        </HStack>
        <Text fontSize="xs" color="muted" textAlign="center">
          © 2024 HandyBox Technologies. Secure Infrastructure v2.4.0
        </Text>
      </Stack>
    </Box>
  )
}

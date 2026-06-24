'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { ResetPasswordMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormField, IconButton, Input, Link, Logo } from '@ui'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Suspense, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import ResetPassword from '@/app/(auth)/reset-password/graphql/ResetPassword.gql'
import { useUserStore } from '@/app/(auth)/store/user'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import { resetPasswordFormSchema } from './resetPasswordFormSchema'

const isDev = process.env.NODE_ENV === 'development'

function IconLockReset() {
  return (
    <Box color="status.success.fg" display="flex" aria-hidden>
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
    <Box as="span" display="flex" color="text.muted" aria-hidden>
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
      onClick={onToggle}
      aria-label={label}
      minW="var(--input-height)"
      h="var(--input-height)"
      borderRadius="md"
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
        borderColor={met ? 'action.primary' : 'border.default'}
        bg={met ? 'action.primary' : 'transparent'}
        color="text.onGreen"
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
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </Box>
      <Text
        fontSize="sm"
        fontWeight={500}
        color={met ? 'text.default' : 'text.muted'}
      >
        {children}
      </Text>
    </HStack>
  )
}

function IconShieldSmall() {
  return (
    <Box color="text.muted" display="flex" aria-hidden>
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

const numberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/

function ResetPasswordFallback() {
  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="text.muted">Loading…</Text>
    </Box>
  )
}

function MissingResetLinkState() {
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
          <Heading size="xl" color="text.default">
            Reset link required
          </Heading>
          <Text color="text.muted" fontSize="sm" lineHeight="1.6">
            Open the password reset link from your email, or request a new one.
            Links expire after 1 hour.
          </Text>
          <Stack gap={3} w="full" maxW="xs">
            <Link href="/forgot-password" _hover={{ textDecoration: 'none' }}>
              <Button w="full">Request reset link</Button>
            </Link>
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

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  )
  const [showTokenField, setShowTokenField] = useState(
    () => isDev && !tokenFromUrl,
  )
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue =
    useWatch({ control, name: 'newPassword', defaultValue: '' }) ?? ''

  const hasMinLength = newPasswordValue.length >= 8
  const hasNumberOrSymbol = numberOrSymbol.test(newPasswordValue)
  const hasUppercase = /[A-Z]/.test(newPasswordValue)

  const getUser = useUserStore((s) => s.getUser)
  const [resetPassword, { loading }] =
    useMutation<ResetPasswordMutation>(ResetPassword)

  const onValid = async (data: z.infer<typeof resetPasswordFormSchema>) => {
    setServerError(null)
    try {
      const res = await resetPassword({
        variables: { token: data.token.trim(), newPassword: data.newPassword },
      })

      const authToken = res.data?.resetPassword?.token
      if (!authToken) {
        throw new Error(
          'Password reset succeeded but no session token was returned.',
        )
      }

      setAuthToken(authToken)
      await getUser()
      trackFlowSucceeded(EVENTS.password_reset_success)
      router.push('/dashboard')
    } catch (err: unknown) {
      trackFlowFailed(EVENTS.password_reset_fail, err, {
        flow: 'password_reset',
        action: 'resetPassword',
        operation: 'ResetPassword',
        route: '/reset-password',
      })
      setServerError(getFriendlyErrorMessage(err, 'Could not reset password.'))
    }
  }

  const tokenWatch =
    useWatch({ control, name: 'token', defaultValue: tokenFromUrl }) ?? ''

  if (!tokenFromUrl && !isDev) {
    return <MissingResetLinkState />
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
        <Stack gap={6} align="center" textAlign="center">
          <Box
            boxSize={12}
            borderRadius="lg"
            bg="status.success.soft"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconLockReset />
          </Box>

          <Box>
            <Heading size="xl" color="text.default">
              Reset password
            </Heading>
            <Text mt={2} color="text.muted" fontSize="sm">
              Create a new, strong password for your account.
            </Text>
          </Box>

          <Box asChild w="full">
            <form onSubmit={handleSubmit(onValid)} noValidate>
              <Stack gap={4} textAlign="left">
                {isDev && (showTokenField || !tokenWatch) && (
                  <FormField
                    label="Reset token"
                    errorText={errors.token?.message}
                  >
                    <Input
                      placeholder="Paste token from your email"
                      autoComplete="one-time-code"
                      rootProps={{ minH: '48px', w: 'full' }}
                      {...register('token')}
                    />
                  </FormField>
                )}

                {isDev && tokenWatch && !showTokenField ? (
                  <Text fontSize="xs" color="text.muted" textAlign="center">
                    <Box
                      asChild
                      display="inline"
                      fontWeight={600}
                      color="text.link"
                      _hover={{ color: 'status.success.fg' }}
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

                <FormField
                  label="New password"
                  errorText={errors.newPassword?.message}
                >
                  <Input
                    endElement={
                      <PasswordToggleButton
                        visible={showNew}
                        onToggle={() => setShowNew((v) => !v)}
                        label={showNew ? 'Hide password' : 'Show password'}
                      />
                    }
                    placeholder="••••••••"
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    rootProps={{ minH: '48px', w: 'full' }}
                    {...register('newPassword')}
                  />
                </FormField>

                <FormField
                  label="Confirm new password"
                  errorText={errors.confirmPassword?.message}
                >
                  <Input
                    endElement={
                      <PasswordToggleButton
                        visible={showConfirm}
                        onToggle={() => setShowConfirm((v) => !v)}
                        label={
                          showConfirm
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                      />
                    }
                    placeholder="••••••••"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    rootProps={{ minH: '48px', w: 'full' }}
                    {...register('confirmPassword')}
                  />
                </FormField>

                <Stack
                  gap={2.5}
                  p={4}
                  borderRadius="lg"
                  bg="status.success.soft"
                  w="full"
                >
                  <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.12em"
                    color="text.muted"
                    textTransform="uppercase"
                  >
                    Password requirements
                  </Text>
                  <ReqRow met={hasMinLength}>8+ characters required</ReqRow>
                  <ReqRow met={hasNumberOrSymbol}>
                    Include a number or symbol
                  </ReqRow>
                  <ReqRow met={hasUppercase}>One uppercase letter</ReqRow>
                </Stack>

                {serverError ? (
                  <Stack gap={2}>
                    <Text role="alert" color="status.danger.fg" fontSize="sm">
                      {serverError}
                    </Text>
                    <Link
                      href="/forgot-password"
                      fontSize="sm"
                      fontWeight={600}
                      color="text.link"
                      _hover={{
                        textDecoration: 'none',
                        color: 'status.success.fg',
                      }}
                    >
                      Request a new reset link
                    </Link>
                  </Stack>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  w="full"
                  borderRadius="lg"
                  size="lg"
                >
                  Update password
                  <IconArrowRight />
                </Button>
              </Stack>
            </form>
          </Box>

          <Link
            href="/login"
            fontSize="sm"
            fontWeight={700}
            color="text.link"
            _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
          >
            ← Back to sign in
          </Link>
        </Stack>
      </Box>

      <HStack gap={2} color="text.muted" justify="center">
        <IconShieldSmall />
        <Text fontSize="xs">Secure connection</Text>
      </HStack>
      <Text fontSize="xs" color="text.muted" textAlign="center">
        © {new Date().getFullYear()} Slashie
      </Text>
    </Stack>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { ResetPasswordMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormField, IconButton, Input, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { resetPasswordFormSchema } from '@/app/(auth)/reset-password/resetPasswordFormSchema'
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
    <Box as="span" display="flex" color="formLabelMuted" aria-hidden>
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
      color="formLabelMuted"
      _hover={{ bg: 'badgeBg' }}
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
        borderColor={met ? 'primary.500' : 'formControlBorder'}
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
      <Text
        fontSize="sm"
        fontWeight={500}
        color={met ? 'cardFg' : 'formLabelMuted'}
      >
        {children}
      </Text>
    </HStack>
  )
}

function IconShieldSmall() {
  return (
    <Box color="formLabelMuted" display="flex" aria-hidden>
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = useMemo(
    () => searchParams.get('token')?.trim() ?? '',
    [searchParams],
  )
  const [showTokenField, setShowTokenField] = useState(() => !tokenFromUrl)
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

  const [resetPassword, { loading }] = useMutation<ResetPasswordMutation>(
    RESET_PASSWORD_MUTATION,
  )

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
      router.push('/dashboard')
    } catch (err: unknown) {
      setServerError(getFriendlyErrorMessage(err, 'Could not reset password.'))
    }
  }

  const tokenWatch =
    useWatch({ control, name: 'token', defaultValue: tokenFromUrl }) ?? ''

  return (
    <Stack gap={6} w="full">
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
            <Heading size="xl" color="cardFg">
              Reset password
            </Heading>
            <Text mt={2} color="formLabelMuted" fontSize="sm">
              Create a new, strong password for your account.
            </Text>
          </Box>

          <Box asChild w="full">
            <form onSubmit={handleSubmit(onValid)} noValidate>
              <Stack gap={4} textAlign="left">
                {(showTokenField || !tokenWatch) && (
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

                {tokenWatch && !showTokenField ? (
                  <Text fontSize="xs" color="formLabelMuted" textAlign="center">
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
                  bg="primary.100"
                  w="full"
                >
                  <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.12em"
                    color="formLabelMuted"
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
                  <Text role="alert" color="red.500" fontSize="sm">
                    {serverError}
                  </Text>
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
            as={NextLink}
            href="/login"
            fontSize="sm"
            fontWeight={700}
            color="primary.600"
            _hover={{ color: 'primary.700', textDecoration: 'none' }}
          >
            ← Back to sign in
          </Link>
        </Stack>
      </Box>

      <HStack gap={2} color="formLabelMuted" justify="center">
        <IconShieldSmall />
        <Text fontSize="xs">Secure connection</Text>
      </HStack>
      <Text fontSize="xs" color="formLabelMuted" textAlign="center">
        © {new Date().getFullYear()} Slashie
      </Text>
    </Stack>
  )
}

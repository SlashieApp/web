'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Stack, Text } from '@chakra-ui/react'
import type { ResetPasswordMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { LuLink2Off } from 'react-icons/lu'

import authBag from '@/app/(auth)/components/i11n.json'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { PasswordInput } from '@/app/(auth)/components/ui/AuthFields'
import {
  type AuthCommonMessage,
  commonAuthMessage,
} from '@/app/(auth)/helpers/authMessages'
import { useUserStore } from '@/app/(auth)/store/user'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { MY_TASKS_HREF } from '@/utils/appRoutes'
import { setAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { Button, FormField, Input, Link } from '@ui'

import ResetPassword from '../graphql/ResetPassword.gql'
import bag from '../i11n.json'
import {
  type ResetPasswordFormValues,
  type ResetPasswordValidationKey,
  resetPasswordFormSchema,
} from '../resetPasswordFormSchema'

const isDev = process.env.NODE_ENV === 'development'

type ResetPasswordMessage =
  | 'linkExpired'
  | 'weakPassword'
  | 'failed'
  | AuthCommonMessage

function resetMessageFor(error: unknown): ResetPasswordMessage {
  const code = getGraphQLErrorCode(error)
  if (code === 'INVALID_OR_EXPIRED_RESET_TOKEN') return 'linkExpired'
  if (code === 'WEAK_PASSWORD') return 'weakPassword'
  return commonAuthMessage(error) ?? 'failed'
}

function BackToLogin() {
  const shared = useI11n(authBag)
  return (
    <Link href="/login" fontWeight={700} color="text.link">
      {shared.backToLogin}
    </Link>
  )
}

/** Opened without a token: ask for a new link. */
export function ResetLinkMissing() {
  const t = useI11n(bag)
  return (
    <AuthCard
      icon={LuLink2Off}
      tone="warning"
      title={t.missingTitle}
      description={t.missingDescription}
      footer={<BackToLogin />}
    >
      <Button asChild w="full" size="lg" minH="48px">
        <Link href="/forgot-password" _hover={{ textDecoration: 'none' }}>
          {t.missingCta}
        </Link>
      </Button>
    </AuthCard>
  )
}

/** /reset-password: a new password from the emailed link, then into the app. */
export function ResetPasswordScreen() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const tokenFromUrl = useSearchParams().get('token')?.trim() ?? ''
  const [showTokenField, setShowTokenField] = useState(
    () => isDev && !tokenFromUrl,
  )
  const [message, setMessage] = useState<ResetPasswordMessage | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  })
  const tokenWatch =
    useWatch({ control, name: 'token', defaultValue: tokenFromUrl }) ?? ''
  const fieldError = (key: string | undefined) =>
    key ? t.validation[key as ResetPasswordValidationKey] : undefined

  const getUser = useUserStore((s) => s.getUser)
  const [resetPassword, { loading }] =
    useMutation<ResetPasswordMutation>(ResetPassword)

  const onValid = async (data: ResetPasswordFormValues) => {
    setMessage(null)
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
      router.push(localize(MY_TASKS_HREF))
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.password_reset_fail, error, {
        flow: 'password_reset',
        action: 'resetPassword',
        operation: 'ResetPassword',
        route: '/reset-password',
      })
      setMessage(resetMessageFor(error))
    }
  }

  if (!tokenFromUrl && !isDev) return <ResetLinkMissing />

  const messageText =
    message === 'linkExpired' ||
    message === 'weakPassword' ||
    message === 'failed'
      ? t.messages[message]
      : message
        ? shared.messages[message]
        : null

  return (
    <AuthCard
      title={t.title}
      description={t.description}
      footer={<BackToLogin />}
    >
      <Box asChild w="full">
        <form method="post" onSubmit={handleSubmit(onValid)} noValidate>
          <Stack gap={4}>
            {/* Dev only: paste a token when testing without the email link. */}
            {isDev && (showTokenField || !tokenWatch) ? (
              <FormField
                label="Reset token"
                errorText={fieldError(errors.token?.message)}
              >
                <Input
                  placeholder="Paste token from your email"
                  autoComplete="one-time-code"
                  rootProps={{ minH: '48px', w: 'full' }}
                  {...register('token')}
                />
              </FormField>
            ) : null}
            {isDev && tokenWatch && !showTokenField ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                alignSelf="center"
                onClick={() => setShowTokenField(true)}
              >
                Enter or edit reset token
              </Button>
            ) : null}

            <FormField
              label={t.newPasswordLabel}
              helperText={shared.fields.passwordHint}
              errorText={fieldError(errors.newPassword?.message)}
            >
              <PasswordInput
                autoComplete="new-password"
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label={t.confirmPasswordLabel}
              errorText={fieldError(errors.confirmPassword?.message)}
            >
              <PasswordInput
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </FormField>

            {messageText ? (
              <Stack gap={2}>
                <AuthAlert>{messageText}</AuthAlert>
                {message === 'linkExpired' ? (
                  <Text fontSize="sm">
                    <Link
                      href="/forgot-password"
                      fontWeight={700}
                      color="text.link"
                    >
                      {t.missingCta}
                    </Link>
                  </Text>
                ) : null}
              </Stack>
            ) : null}

            <Button
              type="submit"
              loading={loading}
              w="full"
              size="lg"
              minH="48px"
            >
              {t.submit}
            </Button>
          </Stack>
        </form>
      </Box>
    </AuthCard>
  )
}

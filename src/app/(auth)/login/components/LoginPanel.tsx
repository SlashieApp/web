'use client'

import { Box, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import authBag from '@/app/(auth)/components/i11n.json'
import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { AuthDivider } from '@/app/(auth)/components/ui/AuthDivider'
import {
  AuthCheckbox,
  EmailInput,
  PasswordInput,
} from '@/app/(auth)/components/ui/AuthFields'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { TurnstileField } from '@/app/(auth)/components/ui/TurnstileField'
import {
  type DeletionNotice,
  formatDeletionDate,
} from '@/app/(auth)/helpers/accountDeletion'
import { stashResetEmail } from '@/app/(auth)/helpers/resetEmailHandoff'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, Link } from '@ui'

import bag from '../i11n.json'
import {
  type LoginFormValues,
  type LoginValidationKey,
  loginFormSchema,
} from '../loginFormSchema'
import { LOGIN_VIEWS, type LoginMessage, type LoginView } from '../views'

export type LoginPanelProps = {
  /** A form view (`LOGIN_VIEWS[view].form`). */
  view: LoginView
  /** The last failed attempt, if any. */
  message: LoginMessage | null
  /** Account notice from the link (deletion scheduled, restore). */
  notice: DeletionNotice | null
  /** Countdown for `waitToRetry`. */
  retryInSeconds: number
  submitting: boolean
  /** The security check has a token. */
  securitySolved: boolean
  securityResetSignal: number
  onSecurityToken: (token: string | null) => void
  /** Validated return path, carried to Google and Apple. */
  next: string | null
  registerHref: string
  defaultValues: Pick<LoginFormValues, 'email' | 'password'>
  onSubmit: (values: LoginFormValues) => void
}

/** The sign-in card: renders the view's config, no state logic of its own. */
export function LoginPanel({
  view,
  message,
  notice,
  retryInSeconds,
  submitting,
  securitySolved,
  securityResetSignal,
  onSecurityToken,
  next,
  registerHref,
  defaultValues,
  onSubmit,
}: LoginPanelProps) {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const locale = useLocale()
  const config = LOGIN_VIEWS[view]
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { ...defaultValues, rememberMe: false },
  })
  const emailValue = useWatch({ control, name: 'email', defaultValue: '' })
  const fieldError = (key: string | undefined) =>
    key ? t.validation[key as LoginValidationKey] : undefined

  const waiting = config.primaryAction === 'waitToRetry'
  const disabled =
    waiting || (config.primaryAction === 'logInAfterCheck' && !securitySolved)
  const messageText =
    message === 'invalidCredentials' || message === 'failed'
      ? t.messages[message]
      : message
        ? shared.messages[message]
        : null

  const noticeText = !notice
    ? null
    : notice.kind === 'restore'
      ? t.restoreNotice
      : notice.date
        ? formatMessage(t.deletionScheduled, {
            // Midday UTC so the day doesn't shift across time zones.
            date: formatDeletionDate(`${notice.date}T12:00:00Z`, locale),
          })
        : t.deletionScheduledNoDate

  return (
    <AuthCard
      title={t.title}
      description={t.description}
      notice={
        noticeText ? <AuthAlert tone="info">{noticeText}</AuthAlert> : null
      }
      footer={
        <>
          {t.registerPrompt}{' '}
          <Link href={registerHref} fontWeight={700} color="text.link">
            {t.registerLink}
          </Link>
        </>
      }
    >
      <Stack gap={3}>
        <GoogleAuthButton next={next} />
        <AppleAuthButton next={next} />
      </Stack>
      <AuthDivider />
      <Box asChild w="full">
        <form
          onSubmit={handleSubmit((values) => {
            if (!disabled) onSubmit(values)
          })}
          noValidate
        >
          <Stack gap={4}>
            <FormField
              label={t.emailLabel}
              errorText={fieldError(errors.email?.message)}
            >
              <EmailInput autoComplete="username" {...register('email')} />
            </FormField>

            <Stack gap={1.5}>
              <FormField
                label={t.passwordLabel}
                errorText={fieldError(errors.password?.message)}
              >
                <PasswordInput
                  autoComplete="current-password"
                  {...register('password')}
                />
              </FormField>
              {/* Outside the label so the field's name stays "Password". */}
              <Link
                href="/forgot-password"
                alignSelf="flex-end"
                fontSize="sm"
                fontWeight={600}
                color="text.link"
                onClick={() => stashResetEmail(emailValue ?? '')}
              >
                {t.forgotPassword}
              </Link>
            </Stack>

            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <AuthCheckbox
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  inputRef={field.ref}
                  label={t.remember}
                />
              )}
            />

            {config.securityCheck ? (
              <TurnstileField
                onTokenChange={onSecurityToken}
                resetSignal={securityResetSignal}
              />
            ) : null}

            {messageText ? <AuthAlert>{messageText}</AuthAlert> : null}

            <Button
              type="submit"
              loading={submitting}
              disabled={disabled}
              w="full"
              size="lg"
              minH="48px"
            >
              {waiting
                ? formatMessage(shared.tryAgainIn, { seconds: retryInSeconds })
                : t.submit}
            </Button>
          </Stack>
        </form>
      </Box>
    </AuthCard>
  )
}

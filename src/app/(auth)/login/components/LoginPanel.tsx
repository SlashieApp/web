'use client'

import { Box, chakra } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import authBag from '@/app/(auth)/components/i11n.json'
import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import {
  AuthCheckbox,
  EmailInput,
  PasswordInput,
} from '@/app/(auth)/components/ui/AuthFields'
import {
  AuthOptions,
  useEmailSection,
} from '@/app/(auth)/components/ui/EmailOption'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { TurnstileField } from '@/app/(auth)/components/ui/TurnstileField'
import {
  type DeletionNotice,
  formatDeletionDate,
} from '@/app/(auth)/helpers/accountDeletion'
import { stashResetEmail } from '@/app/(auth)/helpers/resetEmailHandoff'
import { isSocialAuthConfigured } from '@/app/(auth)/helpers/socialAuthConfig'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  formSpace,
  hitAreaGrowth,
  hitAreaLabel,
  hitAreaLinkFocusRing,
} from '@/theme/styles'
import { Button, FormField, FormStack, Link } from '@ui'

import bag from '../i11n.json'
import {
  type LoginFormValues,
  type LoginValidationKey,
  loginFormSchema,
} from '../loginFormSchema'
import { LOGIN_VIEWS, type LoginMessage, type LoginView } from '../views'

/** "Forgot password?" is one 20px line, like the helper text it replaces. */
const FORGOT_LINK_HEIGHT = 20

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
    setFocus,
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

  // FE-563: the email form opens at once when the page brings an email or a
  // failed try; otherwise when this browser last used email, or on the button.
  const email = useEmailSection(
    Boolean(defaultValues.email) || message !== null || waiting,
  )
  useEffect(() => {
    if (email.openedByTap) setFocus('email')
  }, [email.openedByTap, setFocus])

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
      footer={
        <>
          {t.registerPrompt}{' '}
          <Link href={registerHref} fontWeight={500} color="text.link">
            {t.registerLink}
          </Link>
        </>
      }
    >
      {/* FE-563: Google, Apple, then Continue with email, which opens into
          the divider and the form (FE-481 spacing: the divider owns its 24
          either side). */}
      <Box w="full">
        {noticeText ? (
          <Box mb="form.fieldGap">
            <AuthAlert tone="info">{noticeText}</AuthAlert>
          </Box>
        ) : null}
        <AuthOptions
          social={
            isSocialAuthConfigured() ? (
              <>
                <GoogleAuthButton next={next} />
                <AppleAuthButton next={next} />
              </>
            ) : null
          }
          open={email.open}
          onExpand={email.expand}
        >
          <Box asChild w="full">
            <form
              method="post"
              onSubmit={handleSubmit((values) => {
                if (!disabled) onSubmit(values)
              })}
              noValidate
            >
              <FormStack>
                <FormField
                  label={t.emailLabel}
                  errorText={fieldError(errors.email?.message)}
                >
                  <EmailInput autoComplete="username" {...register('email')} />
                </FormField>

                {/* The link is outside the label, so the field's name stays "Password". */}
                <FormField
                  label={t.passwordLabel}
                  errorText={fieldError(errors.password?.message)}
                  helperAction={
                    <Link
                      href="/forgot-password"
                      display="block"
                      fontWeight={500}
                      color="text.link"
                      onClick={() => stashResetEmail(emailValue ?? '')}
                      // 44 to tap, reaching up to the field's edge and down into
                      // the gap; the keyboard ring hugs the text, not the 44.
                      {...hitAreaGrowth(
                        FORGOT_LINK_HEIGHT,
                        formSpace.controlToHelper,
                      )}
                      {...hitAreaLinkFocusRing}
                    >
                      <chakra.span {...hitAreaLabel}>
                        {t.forgotPassword}
                      </chakra.span>
                    </Link>
                  }
                >
                  <PasswordInput
                    autoComplete="current-password"
                    {...register('password')}
                  />
                </FormField>

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
                  size="form"
                >
                  {waiting
                    ? formatMessage(shared.tryAgainIn, {
                        seconds: retryInSeconds,
                      })
                    : t.submit}
                </Button>
              </FormStack>
            </form>
          </Box>
        </AuthOptions>
      </Box>
    </AuthCard>
  )
}

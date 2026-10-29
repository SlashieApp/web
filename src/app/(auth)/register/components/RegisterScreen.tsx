'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Text } from '@chakra-ui/react'
import type { RegisterMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import authBag from '@/app/(auth)/components/i11n.json'
import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import {
  AuthCheckbox,
  EmailInput,
  PasswordInput,
} from '@/app/(auth)/components/ui/AuthFields'
import { GoogleAuthButton } from '@/app/(auth)/components/ui/GoogleAuthButton'
import { TurnstileField } from '@/app/(auth)/components/ui/TurnstileField'
import { parseAuthAbuseError } from '@/app/(auth)/helpers/authAbuseErrors'
import {
  clearRegisterFailCount,
  getRegisterFailCount,
  incrementRegisterFailCount,
} from '@/app/(auth)/helpers/authFailCount'
import {
  type AuthCommonMessage,
  commonAuthMessage,
} from '@/app/(auth)/helpers/authMessages'
import { authSwitchHref } from '@/app/(auth)/helpers/authRedirect'
import { captchaMutationContext } from '@/app/(auth)/helpers/captchaMutationContext'
import { isSocialAuthConfigured } from '@/app/(auth)/helpers/socialAuthConfig'
import { useCooldownSeconds } from '@/app/(auth)/helpers/useCooldownSeconds'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'
import { useUserStore } from '@/app/(auth)/store/user'
import UpdateMySettings from '@/app/(dashboard)/account/graphql/UpdateMySettings.gql'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { setAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import {
  Button,
  FormAlternatives,
  FormDivider,
  FormField,
  FormStack,
  Input,
  Link,
} from '@ui'

import Register from '../graphql/Register.gql'
import bag from '../i11n.json'
import {
  type RegisterFormValues,
  type RegisterValidationKey,
  registerFormSchema,
} from '../registerFormSchema'

type RegisterMessage =
  | 'emailTaken'
  | 'weakPassword'
  | 'failed'
  | AuthCommonMessage

function registerMessageFor(error: unknown): RegisterMessage {
  const code = getGraphQLErrorCode(error)
  if (code === 'EMAIL_ALREADY_REGISTERED') return 'emailTaken'
  if (code === 'WEAK_PASSWORD') return 'weakPassword'
  return commonAuthMessage(error) ?? 'failed'
}

/**
 * /register, in the form spacing order (FE-481): the fields, then the 18+,
 * Terms and marketing boxes as the last field group above the main button, the
 * "Or continue with" divider, then Google and Apple. The 18+ and Terms boxes
 * still gate every way in: the form checks them on submit, and Google and Apple
 * stay blocked, with a hint under them, until both are ticked.
 */
export function RegisterScreen() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const getUser = useUserStore((s) => s.getUser)
  const [message, setMessage] = useState<RegisterMessage | null>(null)
  const captcha = useProgressiveCaptcha({
    initialFailCount: getRegisterFailCount(),
  })
  const { seconds: retryInSeconds, startCooldown } = useCooldownSeconds()

  const {
    register: registerField,
    handleSubmit,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isOver18: false,
      agreedToTerms: false,
      marketingOptIn: false,
    },
  })
  const fieldError = (key: string | undefined) =>
    key ? t.validation[key as RegisterValidationKey] : undefined

  const oauthBlocked = !watch('isOver18') || !watch('agreedToTerms')
  const marketingOptIn = watch('marketingOptIn')
  const [updateSettings] = useMutation(UpdateMySettings)
  const [registerMutation, { loading }] =
    useMutation<RegisterMutation>(Register)

  /** BE-65: accounts start opted out; apply an explicit opt-in once signed in. */
  const applyMarketingOptIn = async () => {
    if (!marketingOptIn) return
    try {
      await updateSettings({ variables: { input: { marketingEmails: true } } })
    } catch {
      // Best effort: the toggle on Account settings stays available.
    }
  }

  const waiting = retryInSeconds > 0
  const checkPending = captcha.requiresCaptcha && !captcha.token

  const onValid = async (data: RegisterFormValues) => {
    setMessage(null)
    if (waiting || checkPending) return

    const hadCaptcha = captcha.requiresCaptcha
    const failCountAtSubmit = captcha.failCount
    try {
      const res = await registerMutation({
        variables: {
          email: data.email,
          password: data.password,
          name: data.fullName.trim() || undefined,
        },
        context: captchaMutationContext(captcha.token),
      })
      const token = res.data?.register?.token
      if (!token) {
        throw new Error(
          'Registration succeeded but no session token was returned.',
        )
      }

      setAuthToken(token)
      await getUser()
      await applyMarketingOptIn()
      clearRegisterFailCount()
      captcha.setFailCount(0)
      trackFlowSucceeded(EVENTS.register_success, {
        method: 'password',
        had_captcha: hadCaptcha,
        fail_count_client: failCountAtSubmit,
      })
      router.push(
        next
          ? `/verify-email/sent?${new URLSearchParams({ next })}`
          : '/verify-email/sent',
      )
    } catch (error: unknown) {
      const fails = incrementRegisterFailCount()
      captcha.setFailCount(fails)
      const abuse = parseAuthAbuseError(error)
      if (abuse.captchaRequired) captcha.markApiRequiresCaptcha()
      else captcha.resetChallenge()
      if (abuse.retryAfterSeconds) startCooldown(abuse.retryAfterSeconds)
      trackFlowFailed(EVENTS.register_fail, error, {
        flow: 'register',
        action: 'register',
        operation: 'Register',
        route: '/register',
        extra: {
          method: 'password',
          had_captcha: hadCaptcha,
          fail_count_client: fails,
          rate_limited: abuse.rateLimited,
        },
      })
      setMessage(registerMessageFor(error))
    }
  }

  const messageText =
    message === 'emailTaken' ||
    message === 'weakPassword' ||
    message === 'failed'
      ? t.messages[message]
      : message
        ? shared.messages[message]
        : null
  const askConsent = () => void trigger(['isOver18', 'agreedToTerms'])

  return (
    <AuthCard
      title={t.title}
      description={t.description}
      footer={
        <>
          {t.loginPrompt}{' '}
          <Link
            href={authSwitchHref('/login', searchParams)}
            fontWeight={500}
            color="text.link"
          >
            {t.loginLink}
          </Link>
        </>
      }
    >
      {/* The divider owns its 24 either side, so this is a plain box, not a
          gapped stack: FormStack gives the fields, the boxes and the main
          button their 20, FormAlternatives the 8 between Google and Apple. */}
      <Box w="full">
        <Box asChild w="full">
          <form method="post" onSubmit={handleSubmit(onValid)} noValidate>
            <FormStack>
              <FormField
                label={t.fullNameLabel}
                errorText={fieldError(errors.fullName?.message)}
              >
                <Input
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  {...registerField('fullName')}
                />
              </FormField>

              <FormField
                label={t.emailLabel}
                errorText={fieldError(errors.email?.message)}
              >
                <EmailInput autoComplete="email" {...registerField('email')} />
              </FormField>

              <FormField
                label={t.passwordLabel}
                helperText={shared.fields.passwordHint}
                errorText={fieldError(errors.password?.message)}
              >
                <PasswordInput
                  autoComplete="new-password"
                  {...registerField('password')}
                />
              </FormField>

              <FormField
                label={t.confirmPasswordLabel}
                errorText={fieldError(errors.confirmPassword?.message)}
              >
                <PasswordInput
                  autoComplete="new-password"
                  {...registerField('confirmPassword')}
                />
              </FormField>

              {/* The last field group: each row is a field in the 20 rhythm. */}
              <Controller
                name="isOver18"
                control={control}
                render={({ field }) => (
                  <AuthCheckbox
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    inputRef={field.ref}
                    label={t.over18Label}
                    errorText={fieldError(errors.isOver18?.message)}
                  />
                )}
              />
              <Controller
                name="agreedToTerms"
                control={control}
                render={({ field }) => (
                  <AuthCheckbox
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    inputRef={field.ref}
                    errorText={fieldError(errors.agreedToTerms?.message)}
                    label={
                      <>
                        {t.termsBefore}{' '}
                        <Link href="/terms" fontWeight={500} color="text.link">
                          {t.termsLink}
                        </Link>{' '}
                        {t.termsAnd}{' '}
                        <Link
                          href="/privacy"
                          fontWeight={500}
                          color="text.link"
                        >
                          {t.privacyLink}
                        </Link>
                        .
                      </>
                    }
                  />
                )}
              />
              <Controller
                name="marketingOptIn"
                control={control}
                render={({ field }) => (
                  <AuthCheckbox
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    inputRef={field.ref}
                    label={t.marketingOptIn}
                  />
                )}
              />

              {captcha.requiresCaptcha ? (
                <TurnstileField
                  onTokenChange={captcha.setToken}
                  resetSignal={captcha.resetSignal}
                />
              ) : null}

              {messageText ? <AuthAlert>{messageText}</AuthAlert> : null}

              <Button
                type="submit"
                loading={loading}
                disabled={waiting || checkPending}
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

        {isSocialAuthConfigured() ? (
          <>
            <FormDivider />
            <FormAlternatives>
              <GoogleAuthButton
                next={next}
                blocked={oauthBlocked}
                blockedTitle={t.googleBlockedTitle}
                blockedDescription={t.googleBlockedDescription}
                onBlocked={askConsent}
                onSignedIn={applyMarketingOptIn}
              />
              <AppleAuthButton
                next={next}
                blocked={oauthBlocked}
                onBlocked={askConsent}
                onSignedIn={applyMarketingOptIn}
              />
              {oauthBlocked ? (
                <Text fontSize="xs" color="text.muted" lineHeight="tall">
                  {t.googleConsentHint}
                </Text>
              ) : null}
            </FormAlternatives>
          </>
        ) : null}
      </Box>
    </AuthCard>
  )
}

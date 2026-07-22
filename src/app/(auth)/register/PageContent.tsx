'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Checkbox, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { RegisterMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge, Button, FormField, IconButton, Input, Link, Logo } from '@ui'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'

import type { Control } from 'react-hook-form'

import { GoogleAuthButton } from '@/app/(auth)/components/GoogleAuthButton'
import { TurnstileField } from '@/app/(auth)/components/TurnstileField'
import {
  getAuthAbuseFriendlyMessage,
  parseAuthAbuseError,
} from '@/app/(auth)/helpers/authAbuseErrors'
import {
  clearRegisterFailCount,
  getRegisterFailCount,
  incrementRegisterFailCount,
} from '@/app/(auth)/helpers/authFailCount'
import { captchaMutationContext } from '@/app/(auth)/helpers/captchaMutationContext'
import { useCooldownSeconds } from '@/app/(auth)/helpers/useCooldownSeconds'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'
import Register from '@/app/(auth)/register/graphql/Register.gql'
import {
  type RegisterFormValues,
  registerFormSchema,
} from '@/app/(auth)/register/registerFormSchema'
import { useUserStore } from '@/app/(auth)/store/user'
import { usePageI11n } from '@/i18n/usePageI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import bag from './i11n.json'

function FieldIconMail() {
  return (
    <Box as="span" color="text.muted" display="flex" aria-hidden>
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

function FieldIconLock() {
  return (
    <Box as="span" color="text.muted" display="flex" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Password</title>
        <path
          d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
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

/**
 * Required consent checkbox (18+ confirmation, Terms/Privacy agreement).
 * Renders unticked; the zod schema blocks submission until checked.
 */
function ConsentCheckboxField({
  control,
  name,
  label,
  errorText,
}: {
  control: Control<RegisterFormValues>
  name: 'isOver18' | 'agreedToTerms'
  label: ReactNode
  errorText?: string
}) {
  return (
    <Stack gap={1}>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ref, name: fieldName } }) => (
          <Checkbox.Root
            name={fieldName}
            ref={ref}
            checked={value}
            onCheckedChange={(detail) => onChange(Boolean(detail.checked))}
            colorPalette="blue"
          >
            <Checkbox.HiddenInput />
            <HStack gap={3} align="flex-start">
              <Checkbox.Control
                mt={0.5}
                borderRadius="md"
                borderWidth="1px"
                borderColor="border.default"
                bg="bg.surface"
                _checked={{
                  bg: 'action.primary',
                  borderColor: 'action.primary',
                  color: 'text.onGreen',
                }}
              >
                <Checkbox.Indicator color="inherit" />
              </Checkbox.Control>
              <Checkbox.Label
                fontSize="sm"
                fontWeight={500}
                color="text.default"
                lineHeight="1.5"
              >
                {label}
              </Checkbox.Label>
            </HStack>
          </Checkbox.Root>
        )}
      />
      {errorText ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorText}
        </Text>
      ) : null}
    </Stack>
  )
}

function RegisterFeatureCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={2}
      flex={1}
      minW={0}
      borderRadius="lg"
      px={{ base: 4, md: 5 }}
      py={4}
      bg="bg.glass"
      borderWidth="1px"
      borderColor="border.glass"
      backdropFilter="blur(10px)"
    >
      {children}
    </Stack>
  )
}

function RegisterMarketingAside() {
  const t = usePageI11n(bag)

  return (
    <Box
      position="relative"
      overflow="hidden"
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      justifyContent="space-between"
      minH="100vh"
      px={{ lg: 10, xl: 14 }}
      py={{ lg: 12, xl: 14 }}
      bg="bg.brandHero"
      color="text.onBrand"
      /* SDL: brand/auth hero surface (bg.brandHero) with on-brand white text roles.
         The remaining rgba() below are intentional decorative treatments (grid,
         gradient wash, badge scrim), not semantic color roles. */
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.18}
        bgImage="repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.05) 47px, rgba(255,255,255,0.05) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.05) 47px, rgba(255,255,255,0.05) 48px)"
        pointerEvents="none"
        aria-hidden
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        bgImage="linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 42%, transparent 58%, rgba(0,0,0,0.22) 100%)"
        pointerEvents="none"
        aria-hidden
      />

      <Stack gap={8} position="relative" zIndex={1} maxW="lg">
        <Badge
          alignSelf="flex-start"
          bg="rgba(0, 0, 0, 0.35)"
          color="text.onBrand"
          fontSize="2xs"
          letterSpacing="0.1em"
          textTransform="uppercase"
          py={1.5}
          px={3}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(255,255,255,0.12)"
        >
          {t.asideBadge}
        </Badge>

        <Box>
          <Heading
            as="h1"
            fontSize={{ lg: '4xl', xl: '5xl' }}
            lineHeight="1.1"
            fontWeight={800}
            color="text.onBrand"
            letterSpacing="-0.03em"
          >
            {t.asideTitle}
          </Heading>
          <Text
            mt={5}
            fontSize="lg"
            lineHeight="1.55"
            color="text.onBrandMuted"
            fontWeight={500}
          >
            {t.asideDescription}
          </Text>
        </Box>
      </Stack>

      <HStack
        gap={4}
        align="stretch"
        position="relative"
        zIndex={1}
        w="full"
        maxW="lg"
        mt={{ lg: 12 }}
      >
        <RegisterFeatureCard>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.08em"
            color="text.onBrandSubtle"
            textTransform="uppercase"
          >
            {t.customerLabel}
          </Text>
          <Text
            fontSize="md"
            fontWeight={700}
            color="text.onBrand"
            lineHeight="1.4"
          >
            {t.customerText}
          </Text>
        </RegisterFeatureCard>
        <RegisterFeatureCard>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.08em"
            color="text.onBrandSubtle"
            textTransform="uppercase"
          >
            {t.workerLabel}
          </Text>
          <Text
            fontSize="md"
            fontWeight={700}
            color="text.onBrand"
            lineHeight="1.4"
          >
            {t.workerText}
          </Text>
        </RegisterFeatureCard>
      </HStack>
    </Box>
  )
}

export default function RegisterPage() {
  const t = usePageI11n(bag)
  const router = useRouter()
  const getUser = useUserStore((s) => s.getUser)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const captcha = useProgressiveCaptcha({
    initialFailCount: getRegisterFailCount(),
  })
  const {
    seconds: backoffSeconds,
    startCooldown: startBackoff,
    isActive: isBackoffActive,
  } = useCooldownSeconds()

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isOver18: false,
      agreedToTerms: false,
    },
  })

  const [registerMutation, { loading }] =
    useMutation<RegisterMutation>(Register)

  const authQuery = useMemo(() => {
    if (typeof window === 'undefined') {
      return { next: null as string | null, redirect: null as string | null }
    }
    const params = new URLSearchParams(window.location.search)
    return {
      next: params.get('next'),
      redirect: params.get('redirect'),
    }
  }, [])

  const onValid = async (data: z.infer<typeof registerFormSchema>) => {
    setServerError(null)
    if (isBackoffActive) return
    if (captcha.requiresCaptcha && !captcha.token) {
      setServerError('Complete the security check to continue.')
      return
    }

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
      clearRegisterFailCount()
      captcha.setFailCount(0)
      trackFlowSucceeded(EVENTS.register_success, {
        method: 'password',
        had_captcha: hadCaptcha,
        fail_count_client: failCountAtSubmit,
      })

      const sentParams = new URLSearchParams()
      const explicitNextPath = authQuery.redirect ?? authQuery.next
      if (explicitNextPath) sentParams.set('next', explicitNextPath)
      const sentQuery = sentParams.toString()
      router.push(
        sentQuery ? `/verify-email/sent?${sentQuery}` : '/verify-email/sent',
      )
    } catch (err: unknown) {
      const nextFails = incrementRegisterFailCount()
      captcha.setFailCount(nextFails)
      const abuse = parseAuthAbuseError(err)
      if (abuse.captchaRequired || abuse.captchaFailed) {
        captcha.markApiRequiresCaptcha()
      } else {
        captcha.resetChallenge()
      }
      if (abuse.retryAfterSeconds) {
        startBackoff(abuse.retryAfterSeconds)
      }
      trackFlowFailed(EVENTS.register_fail, err, {
        flow: 'register',
        action: 'register',
        operation: 'Register',
        route: '/register',
        extra: {
          method: 'password',
          had_captcha: hadCaptcha,
          fail_count_client: nextFails,
          rate_limited: abuse.rateLimited,
        },
      })
      setServerError(
        getAuthAbuseFriendlyMessage(
          err,
          getFriendlyErrorMessage(err, 'Registration failed'),
        ),
      )
    }
  }

  return (
    <HStack align="stretch" gap={0} minH="100vh" w="full">
      <RegisterMarketingAside />
      <Box
        flex={1}
        bg="bg.subtle"
        display="flex"
        flexDirection="column"
        minH={{ base: '100vh', lg: 'auto' }}
      >
        <Stack
          flex={1}
          justify="center"
          px={{ base: 6, md: 10, xl: 16 }}
          py={{ base: 10, md: 12 }}
          maxW="md"
          w="full"
          mx="auto"
          gap={8}
        >
          <Stack gap={6}>
            <Link
              href="/"
              display="block"
              w="full"
              _hover={{ textDecoration: 'none', opacity: 0.92 }}
            >
              <Logo h="48px" />
            </Link>

            <Box>
              <Heading size="2xl" color="text.default" fontFamily="heading">
                {t.title}
              </Heading>
              <Text mt={2} color="text.muted" fontSize="sm" lineHeight="1.55">
                {t.description}
              </Text>
            </Box>

            <Stack gap={3}>
              <GoogleAuthButton
                next={authQuery.next}
                redirect={authQuery.redirect}
              />
              <Text
                fontSize="2xs"
                fontWeight={700}
                letterSpacing="0.1em"
                color="text.muted"
                textTransform="uppercase"
              >
                Or continue with email
              </Text>
            </Stack>

            <Box asChild w="full">
              <form onSubmit={handleSubmit(onValid)} noValidate>
                <Stack gap={4}>
                  <FormField
                    label="Full name"
                    errorText={errors.fullName?.message}
                  >
                    <Input
                      placeholder="e.g. John Doe"
                      autoComplete="name"
                      rootProps={{ minH: '48px', w: 'full' }}
                      {...registerField('fullName')}
                    />
                  </FormField>

                  <FormField
                    label={t.emailLabel}
                    errorText={errors.email?.message}
                  >
                    <Input
                      startElement={<FieldIconMail />}
                      placeholder="name@company.com"
                      type="email"
                      autoComplete="email"
                      rootProps={{ minH: '48px', w: 'full' }}
                      {...registerField('email')}
                    />
                  </FormField>

                  <HStack
                    gap={4}
                    align="flex-start"
                    flexDir={{ base: 'column', sm: 'row' }}
                  >
                    <FormField
                      label={t.passwordLabel}
                      flex={1}
                      w={{ base: 'full', sm: 'auto' }}
                      errorText={errors.password?.message}
                    >
                      <Input
                        startElement={<FieldIconLock />}
                        endElement={
                          <PasswordToggleButton
                            visible={showPassword}
                            onToggle={() => setShowPassword((v) => !v)}
                            label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                          />
                        }
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        rootProps={{ minH: '48px', w: 'full' }}
                        {...registerField('password')}
                      />
                    </FormField>
                    <FormField
                      label="Confirm password"
                      flex={1}
                      w={{ base: 'full', sm: 'auto' }}
                      errorText={errors.confirmPassword?.message}
                    >
                      <Input
                        startElement={<FieldIconLock />}
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
                        {...registerField('confirmPassword')}
                      />
                    </FormField>
                  </HStack>

                  <Stack gap={3}>
                    <ConsentCheckboxField
                      control={control}
                      name="isOver18"
                      errorText={errors.isOver18?.message}
                      label="I confirm I am 18 or over."
                    />
                    <ConsentCheckboxField
                      control={control}
                      name="agreedToTerms"
                      errorText={errors.agreedToTerms?.message}
                      label={
                        <>
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            fontWeight={700}
                            color="text.link"
                            _hover={{ color: 'status.success.fg' }}
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            fontWeight={700}
                            color="text.link"
                            _hover={{ color: 'status.success.fg' }}
                          >
                            Privacy Policy
                          </Link>
                          .
                        </>
                      }
                    />
                  </Stack>

                  {captcha.requiresCaptcha ? (
                    <TurnstileField
                      onTokenChange={captcha.setToken}
                      resetSignal={captcha.resetSignal}
                    />
                  ) : null}

                  {serverError ? (
                    <Text color="status.danger.fg" fontSize="sm" role="alert">
                      {serverError}
                    </Text>
                  ) : null}

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={
                      isBackoffActive ||
                      (captcha.requiresCaptcha && !captcha.token)
                    }
                    w="full"
                    borderRadius="full"
                    size="lg"
                    minH="48px"
                  >
                    {isBackoffActive
                      ? `Try again in ${backoffSeconds}s`
                      : t.submit}
                  </Button>
                </Stack>
              </form>
            </Box>

            <Stack gap={2} pt={2}>
              <Text fontSize="sm" color="text.muted" textAlign="center">
                {t.loginPrompt}{' '}
                <Link
                  href="/login"
                  fontWeight={700}
                  color="text.link"
                  _hover={{
                    color: 'status.success.fg',
                    textDecoration: 'none',
                  }}
                >
                  {t.loginLink}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </HStack>
  )
}

'use client'

import { Box, Checkbox, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { LuArrowRight, LuEye, LuEyeOff, LuLock, LuMail } from 'react-icons/lu'

import { AppleAuthButton } from '@/app/(auth)/components/ui/AppleAuthButton'
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
import { MARKETING_HOME } from '@/utils/appRoutes'
import { Button, FormField, IconButton, Input, Link, Logo } from '@ui'

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

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <Box as="span" color="text.muted" display="flex" aria-hidden>
      {children}
    </Box>
  )
}

/** The sign-in column: renders the view's config, no state logic of its own. */
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
  const config = LOGIN_VIEWS[view]
  const [showPassword, setShowPassword] = useState(false)
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

  return (
    <Stack flex="1 1 50%" justify="center" maxW="md" w="full" gap={8}>
      <Stack gap={6}>
        <Link
          href={MARKETING_HOME}
          display="block"
          w="full"
          _hover={{ textDecoration: 'none', opacity: 0.92 }}
        >
          <Logo h="48px" />
        </Link>

        <Box>
          <Heading as="h1" size="2xl" color="text.default" fontFamily="heading">
            {t.title}
          </Heading>
          <Text mt={2} color="text.muted" fontSize="sm" lineHeight="1.55">
            {t.description}
          </Text>
        </Box>

        {notice ? <LoginNotice notice={notice} /> : null}

        <Stack gap={3}>
          <GoogleAuthButton next={next} />
          <AppleAuthButton next={next} />
          <Text
            pt={1}
            fontSize="2xs"
            fontWeight={700}
            letterSpacing="0.1em"
            color="text.muted"
            textTransform="uppercase"
          >
            {t.orEmail}
          </Text>
        </Stack>

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
                <Input
                  startElement={
                    <FieldIcon>
                      <LuMail size={18} />
                    </FieldIcon>
                  }
                  placeholder={t.emailPlaceholder}
                  type="email"
                  autoComplete="username"
                  rootProps={{ minH: '48px', w: 'full' }}
                  {...register('email')}
                />
              </FormField>

              <Stack gap={1.5}>
                <FormField
                  label={t.passwordLabel}
                  errorText={fieldError(errors.password?.message)}
                >
                  <Input
                    startElement={
                      <FieldIcon>
                        <LuLock size={18} />
                      </FieldIcon>
                    }
                    endElement={
                      <IconButton
                        type="button"
                        variant="ghost"
                        borderRadius="md"
                        aria-label={
                          showPassword ? t.hidePassword : t.showPassword
                        }
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        <FieldIcon>
                          {showPassword ? (
                            <LuEyeOff size={18} />
                          ) : (
                            <LuEye size={18} />
                          )}
                        </FieldIcon>
                      </IconButton>
                    }
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    rootProps={{ minH: '48px', w: 'full' }}
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
                render={({ field: { value, onChange, ref, name } }) => (
                  <Checkbox.Root
                    name={name}
                    ref={ref}
                    checked={value}
                    onCheckedChange={(detail) =>
                      onChange(Boolean(detail.checked))
                    }
                    colorPalette="green"
                  >
                    <Checkbox.HiddenInput />
                    <HStack gap={3} align="center" py={1} minH="44px">
                      <Checkbox.Control
                        borderRadius="md"
                        borderWidth="0"
                        bg="bg.surface"
                        boxShadow="e1"
                        _checked={{
                          bg: 'action.primary',
                          color: 'text.onGreen',
                        }}
                      >
                        <Checkbox.Indicator color="inherit" />
                      </Checkbox.Control>
                      <Checkbox.Label fontWeight={500} color="text.default">
                        {t.remember}
                      </Checkbox.Label>
                    </HStack>
                  </Checkbox.Root>
                )}
              />

              {config.securityCheck ? (
                <TurnstileField
                  onTokenChange={onSecurityToken}
                  resetSignal={securityResetSignal}
                />
              ) : null}

              {message ? (
                <Text
                  role="alert"
                  color="status.danger.fg"
                  fontSize="sm"
                  fontWeight={500}
                >
                  {t.messages[message]}
                </Text>
              ) : null}

              <Button
                type="submit"
                loading={submitting}
                disabled={disabled}
                w="full"
                borderRadius="full"
                size="lg"
                minH="48px"
              >
                {waiting
                  ? formatMessage(t.tryAgainIn, { seconds: retryInSeconds })
                  : t.submit}
                {waiting ? null : <LuArrowRight aria-hidden />}
              </Button>
            </Stack>
          </form>
        </Box>

        <Stack gap={4} pt={2}>
          <Text fontSize="sm" color="text.muted" textAlign="center">
            {t.registerPrompt}{' '}
            <Link
              href={registerHref}
              fontWeight={700}
              color="text.link"
              _hover={{ color: 'status.success.fg', textDecoration: 'none' }}
            >
              {t.registerLink}
            </Link>
          </Text>
          <Text
            fontSize="xs"
            color="text.muted"
            textAlign="center"
            lineHeight="1.5"
          >
            {t.trustNote}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  )
}

/** FE-198: after requesting deletion (`?deletion=DATE`) or from the deletion emails (`?restore=1`). */
function LoginNotice({ notice }: { notice: DeletionNotice }) {
  const t = useI11n(bag)
  const locale = useLocale()
  const text =
    notice.kind === 'restore'
      ? t.restoreNotice
      : notice.date
        ? formatMessage(t.deletionScheduled, {
            // Midday UTC so the day doesn't shift across time zones.
            date: formatDeletionDate(`${notice.date}T12:00:00Z`, locale),
          })
        : t.deletionScheduledNoDate

  return (
    <Text
      as="output"
      display="block"
      p={3}
      borderRadius="md"
      bg="status.warning.soft"
      color="status.warning.fg"
      fontSize="sm"
      fontWeight={600}
      lineHeight="tall"
    >
      {text}
    </Text>
  )
}

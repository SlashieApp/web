'use client'

import {
  Box,
  Checkbox,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge, Button, FormField, IconButton, Input, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'

import { loginFormSchema } from '@/app/(auth)/login/loginFormSchema'
import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

function FieldIconMail() {
  return (
    <Box as="span" color="formLabelMuted" display="flex" aria-hidden>
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
    <Box as="span" color="formLabelMuted" display="flex" aria-hidden>
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

function SocialIconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <title>Google</title>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function SocialIconApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <title>Apple</title>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
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

function IconArrowRight() {
  return (
    <Box as="span" display="inline-flex" ml={1} aria-hidden>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

function LoginStatCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={1}
      flex={1}
      minW={0}
      borderRadius="lg"
      px={{ base: 4, md: 5 }}
      py={4}
      bg="rgba(255, 255, 255, 0.08)"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.14)"
      backdropFilter="blur(10px)"
    >
      {children}
    </Stack>
  )
}

function LoginMarketingAside() {
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
      bg="primary.800"
      color="white"
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.22}
        bgImage="repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.06) 47px, rgba(255,255,255,0.06) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.06) 47px, rgba(255,255,255,0.06) 48px)"
        pointerEvents="none"
        aria-hidden
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.12}
        bgImage="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 42%, transparent 58%, rgba(0,0,0,0.2) 100%)"
        pointerEvents="none"
        aria-hidden
      />

      <Stack gap={8} position="relative" zIndex={1} maxW="lg">
        <Badge
          alignSelf="flex-start"
          bg="secondary.300"
          color="secondary.900"
          fontSize="2xs"
          letterSpacing="0.08em"
          textTransform="uppercase"
          py={1.5}
          px={3}
          display="inline-flex"
          alignItems="center"
          gap={2}
        >
          <Box
            as="span"
            display="inline-block"
            w={3.5}
            h={3.5}
            borderRadius="full"
            bg="secondary.600"
            boxShadow="inset 0 0 0 1px rgba(255,255,255,0.25)"
            aria-hidden
          />
          Local task marketplace
        </Badge>

        <Box>
          <Heading
            as="h1"
            fontSize={{ lg: '4xl', xl: '5xl' }}
            lineHeight="1.1"
            fontWeight={800}
            color="white"
            letterSpacing="-0.03em"
          >
            Get local tasks done with confidence.
          </Heading>
          <Text
            mt={5}
            fontSize="lg"
            lineHeight="1.55"
            color="rgba(255, 255, 255, 0.88)"
            fontWeight={500}
          >
            Post a task, compare quotes from nearby workers, and manage
            everything in one place.
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
        <LoginStatCard>
          <Text fontSize="xl" fontWeight={800} lineHeight="1.2" color="white">
            Fast quotes
          </Text>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            From local workers
          </Text>
        </LoginStatCard>
        <LoginStatCard>
          <Text fontSize="xl" fontWeight={800} lineHeight="1.2" color="white">
            Map-first
          </Text>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            Find help nearby
          </Text>
        </LoginStatCard>
      </HStack>
    </Box>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const login = useUserStore((state) => state.login)
  const getUser = useUserStore((state) => state.getUser)
  const loading = useUserStore((state) => state.isLoading)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const authGuardCheckedRef = useRef(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })
  const nextPath = useMemo(() => {
    if (typeof window === 'undefined') return '/dashboard'
    const params = new URLSearchParams(window.location.search)
    const requestedNextPath = params.get('redirect') ?? params.get('next')
    const hasSafeNextPath =
      requestedNextPath?.startsWith('/') && !requestedNextPath.startsWith('//')
    return hasSafeNextPath && requestedNextPath
      ? requestedNextPath
      : '/dashboard'
  }, [])
  const onMountAuthGuard = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || authGuardCheckedRef.current) return
      authGuardCheckedRef.current = true
      if (!getAuthToken()) return
      void getUser().then((user) => {
        if (user) router.replace(nextPath)
      })
    },
    [getUser, nextPath, router],
  )

  const onValid = async (data: z.infer<typeof loginFormSchema>) => {
    setServerError(null)
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })
      router.push(nextPath)
    } catch (err: unknown) {
      setServerError(getFriendlyErrorMessage(err, 'Login failed'))
    }
  }

  return (
    <Box ref={onMountAuthGuard} w="full" minH="100vh">
      <HStack align="stretch" gap={0} minH="100vh" w="full">
        <LoginMarketingAside />
        <Box
          flex={1}
          bg="neutral.100"
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
                as={NextLink}
                href="/"
                display="block"
                w="full"
                _hover={{ textDecoration: 'none', opacity: 0.92 }}
              >
                <Logo h="48px" />
              </Link>

              <Box>
                <Text
                  fontSize="2xs"
                  fontWeight={700}
                  letterSpacing="0.12em"
                  color="formLabelMuted"
                  textTransform="uppercase"
                >
                  ACCOUNT
                </Text>
                <Heading size="2xl" color="cardFg" fontFamily="heading" mt={2}>
                  Welcome back
                </Heading>
                <Text
                  mt={2}
                  color="formLabelMuted"
                  fontSize="sm"
                  lineHeight="1.55"
                >
                  Sign in to manage your tasks, quotes, and worker profile in
                  one place.
                </Text>
              </Box>

              <Stack gap={3}>
                <HStack gap={3}>
                  <Button
                    type="button"
                    variant="secondary"
                    flex={1}
                    borderRadius="xl"
                    borderWidth="0"
                    bg="cardBg"
                    color="cardFg"
                    fontWeight={600}
                    minH="48px"
                    disabled
                    title="Coming soon"
                    opacity={0.72}
                    cursor="not-allowed"
                    boxShadow="sm"
                    _hover={{ bg: 'cardBg' }}
                  >
                    <HStack gap={2} justify="center" w="full">
                      <SocialIconGoogle />
                      Google
                    </HStack>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    flex={1}
                    borderRadius="xl"
                    borderWidth="0"
                    bg="cardBg"
                    color="cardFg"
                    fontWeight={600}
                    minH="48px"
                    disabled
                    title="Coming soon"
                    opacity={0.72}
                    cursor="not-allowed"
                    boxShadow="sm"
                    _hover={{ bg: 'cardBg' }}
                  >
                    <HStack gap={2} justify="center" w="full">
                      <SocialIconApple />
                      Apple
                    </HStack>
                  </Button>
                </HStack>

                <Stack gap={2} pt={1}>
                  <Text
                    fontSize="2xs"
                    fontWeight={700}
                    letterSpacing="0.1em"
                    color="formLabelMuted"
                    textTransform="uppercase"
                  >
                    Or continue with email
                  </Text>
                </Stack>
              </Stack>

              <Box asChild w="full">
                <form onSubmit={handleSubmit(onValid)} noValidate>
                  <Stack gap={4}>
                    <FormField label="Email" errorText={errors.email?.message}>
                      <Input
                        startElement={<FieldIconMail />}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        rootProps={{ minH: '48px', w: 'full' }}
                        {...register('email')}
                      />
                    </FormField>

                    <FormField
                      label={
                        <HStack justify="space-between" w="full" align="center">
                          <Box as="span">Password</Box>
                          <Link
                            as={NextLink}
                            href="/forgot-password"
                            fontSize="sm"
                            fontWeight={600}
                            color="primary.600"
                            _hover={{
                              color: 'primary.700',
                              textDecoration: 'none',
                            }}
                          >
                            Forgot password?
                          </Link>
                        </HStack>
                      }
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
                        autoComplete="current-password"
                        rootProps={{ minH: '48px', w: 'full' }}
                        {...register('password')}
                      />
                    </FormField>

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
                              bg="cardBg"
                              boxShadow="sm"
                              _checked={{
                                bg: 'primary',
                                color: 'black',
                              }}
                            >
                              <Checkbox.Indicator color="inherit" />
                            </Checkbox.Control>
                            <Checkbox.Label fontWeight={500} color="cardFg">
                              Remember me on this device
                            </Checkbox.Label>
                          </HStack>
                        </Checkbox.Root>
                      )}
                    />

                    {serverError ? (
                      <Text
                        role="alert"
                        color="red.500"
                        fontSize="sm"
                        fontWeight={500}
                      >
                        {serverError}
                      </Text>
                    ) : null}

                    <Button
                      type="submit"
                      loading={loading}
                      w="full"
                      borderRadius="full"
                      size="lg"
                      minH="48px"
                    >
                      Log in
                      <IconArrowRight />
                    </Button>
                  </Stack>
                </form>
              </Box>

              <Stack gap={4} pt={2}>
                <Text fontSize="sm" color="formLabelMuted" textAlign="center">
                  New to Slashie?{' '}
                  <Link
                    as={NextLink}
                    href="/register"
                    fontWeight={700}
                    color="primary.600"
                    _hover={{ color: 'primary.700', textDecoration: 'none' }}
                  >
                    Create an account
                  </Link>
                </Text>
                <Text
                  fontSize="xs"
                  color="formLabelMuted"
                  textAlign="center"
                  lineHeight="1.5"
                >
                  Your account helps keep task details, quotes, and worker
                  profiles secure.
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </HStack>
    </Box>
  )
}

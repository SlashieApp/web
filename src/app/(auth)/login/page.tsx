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

import { GoogleAuthButton } from '@/app/(auth)/components/GoogleAuthButton'
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
  const nextPath = useMemo(() => {
    const requestedNextPath = authQuery.redirect ?? authQuery.next
    if (
      requestedNextPath?.startsWith('/') &&
      !requestedNextPath.startsWith('//')
    ) {
      return requestedNextPath
    }
    return '/tasks'
  }, [authQuery])
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
                <GoogleAuthButton
                  next={authQuery.next}
                  redirect={authQuery.redirect}
                  fallbackPath="/tasks"
                />

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

'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Checkbox,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { RegisterMutation } from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge, Button, FormField, IconButton, Input, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'

import { registerFormSchema } from '@/app/(auth)/register/registerFormSchema'
import { REGISTER_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type AccountRole = 'customer' | 'worker'

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

function IconCustomer() {
  return (
    <Box as="span" display="flex" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Customer</title>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconWorker() {
  return (
    <Box as="span" display="flex" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Worker</title>
        <path
          d="m14.5 9.5 5-5M16 8l2 2M3 21l7-7M8 16l-2 2M12 6l6 6-3 3-6-6 3-3Z"
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

function RegisterFeatureCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={2}
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

function RegisterMarketingAside() {
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
          color="white"
          fontSize="2xs"
          letterSpacing="0.1em"
          textTransform="uppercase"
          py={1.5}
          px={3}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(255,255,255,0.12)"
        >
          Join Slashie
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
            Create an account for local tasks and quotes.
          </Heading>
          <Text
            mt={5}
            fontSize="lg"
            lineHeight="1.55"
            color="rgba(255, 255, 255, 0.88)"
            fontWeight={500}
          >
            Post tasks, compare quotes from nearby workers, or set up your
            worker profile to find local work.
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
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            For customers
          </Text>
          <Text fontSize="md" fontWeight={700} color="white" lineHeight="1.4">
            Post tasks and compare quotes
          </Text>
        </RegisterFeatureCard>
        <RegisterFeatureCard>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.08em"
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            For workers
          </Text>
          <Text fontSize="md" fontWeight={700} color="white" lineHeight="1.4">
            Find local tasks and send quotes
          </Text>
        </RegisterFeatureCard>
      </HStack>
    </Box>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<AccountRole>('customer')
  const [serverError, setServerError] = useState<string | null>(null)

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
      agreedToTerms: false,
    },
  })

  const [registerMutation, { loading }] =
    useMutation<RegisterMutation>(REGISTER_MUTATION)

  const explicitNextPath = useMemo(() => {
    if (typeof window === 'undefined') return null
    const requestedNextPath = new URLSearchParams(window.location.search).get(
      'next',
    )
    const hasSafeNextPath =
      requestedNextPath?.startsWith('/') && !requestedNextPath.startsWith('//')
    return hasSafeNextPath && requestedNextPath ? requestedNextPath : null
  }, [])

  const postRegisterPath = useMemo(
    () => (role === 'worker' ? '/dashboard/worker/register' : '/dashboard'),
    [role],
  )

  const onValid = async (data: z.infer<typeof registerFormSchema>) => {
    setServerError(null)
    try {
      const res = await registerMutation({
        variables: { email: data.email, password: data.password },
      })

      const token = res.data?.register?.token
      if (!token) {
        throw new Error(
          'Registration succeeded but no session token was returned.',
        )
      }

      setAuthToken(token)
      router.push(explicitNextPath ?? postRegisterPath)
    } catch (err: unknown) {
      setServerError(getFriendlyErrorMessage(err, 'Registration failed'))
    }
  }

  return (
    <HStack align="stretch" gap={0} minH="100vh" w="full">
      <RegisterMarketingAside />
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
              <Heading size="2xl" color="cardFg" fontFamily="heading">
                Create your account
              </Heading>
              <Text
                mt={2}
                color="formLabelMuted"
                fontSize="sm"
                lineHeight="1.55"
              >
                Choose how you want to start with Slashie.
              </Text>
            </Box>

            <HStack gap={3} align="stretch">
              <Button
                type="button"
                flex={1}
                variant="secondary"
                borderRadius="lg"
                borderWidth="2px"
                borderColor={
                  role === 'customer' ? 'primary.500' : 'formControlBorder'
                }
                bg={role === 'customer' ? 'primary.50' : 'neutral.100'}
                color={role === 'customer' ? 'primary.700' : 'cardFg'}
                fontWeight={700}
                py={6}
                h="auto"
                onClick={() => setRole('customer')}
                _hover={{
                  bg: role === 'customer' ? 'primary.100' : 'cardBg',
                }}
              >
                <Stack gap={1} align="center" w="full">
                  <Box
                    color={
                      role === 'customer' ? 'primary.600' : 'formLabelMuted'
                    }
                  >
                    <IconCustomer />
                  </Box>
                  <Box as="span">Customer</Box>
                  <Text
                    fontSize="xs"
                    fontWeight={600}
                    color={
                      role === 'customer' ? 'primary.600' : 'formLabelMuted'
                    }
                  >
                    Post tasks
                  </Text>
                </Stack>
              </Button>
              <Button
                type="button"
                flex={1}
                variant="secondary"
                borderRadius="lg"
                borderWidth="2px"
                borderColor={
                  role === 'worker' ? 'primary.500' : 'formControlBorder'
                }
                bg={role === 'worker' ? 'primary.50' : 'neutral.100'}
                color={role === 'worker' ? 'primary.700' : 'cardFg'}
                fontWeight={700}
                py={6}
                h="auto"
                onClick={() => setRole('worker')}
                _hover={{
                  bg: role === 'worker' ? 'primary.100' : 'cardBg',
                }}
              >
                <Stack gap={1} align="center" w="full">
                  <Box
                    color={role === 'worker' ? 'primary.600' : 'formLabelMuted'}
                  >
                    <IconWorker />
                  </Box>
                  <Box as="span">Worker</Box>
                  <Text
                    fontSize="xs"
                    fontWeight={600}
                    color={role === 'worker' ? 'primary.600' : 'formLabelMuted'}
                  >
                    Send quotes
                  </Text>
                </Stack>
              </Button>
            </HStack>

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
                    label="Email address"
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
                      label="Password"
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

                  <Stack gap={1}>
                    <Controller
                      name="agreedToTerms"
                      control={control}
                      render={({ field: { value, onChange, ref, name } }) => (
                        <Checkbox.Root
                          name={name}
                          ref={ref}
                          checked={value}
                          onCheckedChange={(detail) =>
                            onChange(Boolean(detail.checked))
                          }
                          colorPalette="blue"
                        >
                          <Checkbox.HiddenInput />
                          <HStack gap={3} align="flex-start">
                            <Checkbox.Control
                              mt={0.5}
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor="formControlBorder"
                              bg="neutral.100"
                              _checked={{
                                bg: 'primary.500',
                                borderColor: 'primary.500',
                                color: 'white',
                              }}
                            >
                              <Checkbox.Indicator color="inherit" />
                            </Checkbox.Control>
                            <Checkbox.Label
                              fontSize="sm"
                              fontWeight={500}
                              color="cardFg"
                              lineHeight="1.5"
                            >
                              I agree to the{' '}
                              <Link
                                as={NextLink}
                                href="/terms"
                                fontWeight={700}
                                color="primary.600"
                                _hover={{ color: 'primary.700' }}
                              >
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link
                                as={NextLink}
                                href="/privacy"
                                fontWeight={700}
                                color="primary.600"
                                _hover={{ color: 'primary.700' }}
                              >
                                Privacy Policy
                              </Link>
                              .
                            </Checkbox.Label>
                          </HStack>
                        </Checkbox.Root>
                      )}
                    />
                    {errors.agreedToTerms?.message ? (
                      <Text color="red.500" fontSize="sm">
                        {errors.agreedToTerms.message}
                      </Text>
                    ) : null}
                  </Stack>

                  {serverError ? (
                    <Text color="red.500" fontSize="sm">
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
                    Create account
                  </Button>
                </Stack>
              </form>
            </Box>

            <Stack gap={2} pt={2}>
              <Text fontSize="sm" color="formLabelMuted" textAlign="center">
                Already have an account?{' '}
                <Link
                  as={NextLink}
                  href="/login"
                  fontWeight={700}
                  color="primary.600"
                  _hover={{ color: 'primary.700', textDecoration: 'none' }}
                >
                  Log in
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </HStack>
  )
}

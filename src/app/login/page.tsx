'use client'

import { ME_QUERY } from '@/graphql/auth'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  Box,
  Checkbox,
  HStack,
  InputGroup,
  Link,
  Stack,
} from '@chakra-ui/react'
import type { LoginMutation, MeQuery } from '@codegen/schema'
import {
  Button,
  FormField,
  HandyBoxWordmark,
  Heading,
  Input,
  LoginMarketingPanel,
  Text,
} from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LOGIN_MUTATION } from '@/graphql/auth'
import { getAuthToken, setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function FieldIconMail() {
  return (
    <Box as="span" color="muted" display="flex" aria-hidden>
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
    <Box as="span" color="muted" display="flex" aria-hidden>
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

function IconShield() {
  return (
    <Box as="span" color="secondary.600" display="inline-flex" aria-hidden>
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState('/dashboard')

  const hasAuthToken = Boolean(getAuthToken())
  const { data: meData } = useQuery<MeQuery>(ME_QUERY, {
    skip: !hasAuthToken,
    fetchPolicy: 'network-only',
  })
  const [login, { loading }] = useMutation<LoginMutation>(LOGIN_MUTATION)

  useEffect(() => {
    const requestedNextPath = new URLSearchParams(window.location.search).get(
      'next',
    )
    const hasSafeNextPath =
      requestedNextPath?.startsWith('/') && !requestedNextPath.startsWith('//')

    if (hasSafeNextPath && requestedNextPath) {
      setNextPath(requestedNextPath)
    }
  }, [])

  useEffect(() => {
    if (!meData?.me) return
    router.replace(nextPath)
  }, [meData?.me, nextPath, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await login({
        variables: { email, password },
      })

      const token = res.data?.login?.token
      if (!token) {
        throw new Error('Login succeeded but no session token was returned.')
      }

      setAuthToken(token, rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE)
      router.push(nextPath)
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err, 'Login failed')
      setError(message)
    }
  }

  return (
    <HStack align="stretch" gap={0} minH="100vh" w="full">
      <LoginMarketingPanel />

      <Box
        flex={1}
        bg="surfaceContainerLowest"
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
              _hover={{ textDecoration: 'none', opacity: 0.9 }}
            >
              <HandyBoxWordmark size="lg" />
            </Link>

            <Box>
              <Heading size="2xl" color="fg">
                Welcome Back
              </Heading>
              <Text mt={2} color="muted" fontSize="sm">
                Enter your credentials to manage your jobs.
              </Text>
            </Box>

            <Stack gap={3}>
              <HStack gap={3}>
                <Button
                  type="button"
                  variant="outline"
                  flex={1}
                  borderRadius="lg"
                  borderColor="outlineVariant"
                  bg="surfaceContainerLowest"
                  color="fg"
                  fontWeight={600}
                  disabled
                  title="Coming soon"
                  opacity={0.85}
                  _hover={{ bg: 'surfaceContainerLow' }}
                >
                  <HStack gap={2} justify="center" w="full">
                    <SocialIconGoogle />
                    Google
                  </HStack>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  flex={1}
                  borderRadius="lg"
                  borderColor="outlineVariant"
                  bg="surfaceContainerLowest"
                  color="fg"
                  fontWeight={600}
                  disabled
                  title="Coming soon"
                  opacity={0.85}
                  _hover={{ bg: 'surfaceContainerLow' }}
                >
                  <HStack gap={2} justify="center" w="full">
                    <SocialIconApple />
                    Apple
                  </HStack>
                </Button>
              </HStack>

              <HStack gap={3} align="center" py={1}>
                <Box flex={1} h="1px" bg="outlineVariant" />
                <Text
                  fontSize="2xs"
                  fontWeight={700}
                  letterSpacing="0.08em"
                  color="muted"
                  textTransform="uppercase"
                  whiteSpace="nowrap"
                >
                  Or continue with email
                </Text>
                <Box flex={1} h="1px" bg="outlineVariant" />
              </HStack>
            </Stack>

            <Box as="form" onSubmit={onSubmit}>
              <Stack gap={4}>
                <FormField label="Email Address">
                  <InputGroup startElement={<FieldIconMail />}>
                    <Input
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="outlineVariant"
                    />
                  </InputGroup>
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
                        _hover={{ color: 'primary.700' }}
                      >
                        Forgot password?
                      </Link>
                    </HStack>
                  }
                >
                  <InputGroup startElement={<FieldIconLock />}>
                    <Input
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="current-password"
                      required
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="outlineVariant"
                    />
                  </InputGroup>
                </FormField>

                <Checkbox.Root
                  checked={rememberMe}
                  onCheckedChange={(detail) =>
                    setRememberMe(Boolean(detail.checked))
                  }
                  colorPalette="blue"
                >
                  <Checkbox.HiddenInput />
                  <HStack gap={3} align="center">
                    <Checkbox.Control
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="outlineVariant"
                      bg="surfaceContainerLowest"
                      _checked={{
                        bg: 'primary.500',
                        borderColor: 'primary.500',
                        color: 'white',
                      }}
                    >
                      <Checkbox.Indicator color="inherit" />
                    </Checkbox.Control>
                    <Checkbox.Label fontWeight={500} color="fg">
                      Remember me
                    </Checkbox.Label>
                  </HStack>
                </Checkbox.Root>

                {error ? (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  w="full"
                  borderRadius="lg"
                  size="lg"
                >
                  Log In
                  <IconArrowRight />
                </Button>
              </Stack>
            </Box>

            <Text fontSize="sm" color="muted" textAlign="center">
              Don’t have an account?{' '}
              <Link
                as={NextLink}
                href="/register"
                fontWeight={700}
                color="primary.600"
                _hover={{ color: 'primary.700', textDecoration: 'none' }}
              >
                Sign up
              </Link>
            </Text>
          </Stack>

          <Box
            mt="auto"
            pt={6}
            borderTopWidth="1px"
            borderColor="outlineVariant"
          >
            <HStack
              flexWrap="wrap"
              gap={{ base: 3, md: 4 }}
              align="center"
              justify={{ base: 'center', sm: 'flex-start' }}
            >
              <HStack gap={0} pl={1}>
                {['#94a3b8', '#64748b', '#475569'].map((bg, i) => (
                  <Box
                    key={bg}
                    boxSize={9}
                    borderRadius="full"
                    bg={bg}
                    borderWidth="2px"
                    borderColor="surfaceContainerLowest"
                    ml={i === 0 ? 0 : -3}
                  />
                ))}
                <Box
                  boxSize={9}
                  borderRadius="full"
                  bg="primary.500"
                  color="white"
                  fontSize="xs"
                  fontWeight={800}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="2px"
                  borderColor="surfaceContainerLowest"
                  ml={-3}
                >
                  +5k
                </Box>
              </HStack>
              <Text
                fontSize="2xs"
                fontWeight={700}
                letterSpacing="0.06em"
                color="muted"
                textTransform="uppercase"
              >
                Trusted by professionals
              </Text>
              <HStack gap={1.5} align="center">
                <IconShield />
                <Text fontSize="xs" fontWeight={600} color="secondary.700">
                  Enterprise-grade security
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Stack>
      </Box>
    </HStack>
  )
}

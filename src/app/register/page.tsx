'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Checkbox,
  HStack,
  IconButton,
  InputGroup,
  Link,
  Stack,
} from '@chakra-ui/react'
import type { RegisterMutation } from '@codegen/schema'
import {
  Button,
  FormField,
  HandyBoxWordmark,
  Heading,
  Input,
  RegisterMarketingPanel,
  Text,
} from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { REGISTER_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type AccountRole = 'homeowner' | 'professional'

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

function IconHouse() {
  return (
    <Box as="span" display="flex" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Home</title>
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

function IconTools() {
  return (
    <Box as="span" display="flex" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Professional</title>
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
    <Box as="span" display="flex" color="muted" aria-hidden>
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
      color="muted"
      _hover={{ bg: 'surfaceContainerHigh' }}
    >
      <IconEye open={!visible} />
    </IconButton>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [role, setRole] = useState<AccountRole>('homeowner')
  const [error, setError] = useState<string | null>(null)
  const [explicitNextPath, setExplicitNextPath] = useState<string | null>(null)

  const [register, { loading }] =
    useMutation<RegisterMutation>(REGISTER_MUTATION)

  const postRegisterPath = useMemo(
    () =>
      role === 'professional' ? '/dashboard/worker/register' : '/dashboard',
    [role],
  )

  useEffect(() => {
    const requestedNextPath = new URLSearchParams(window.location.search).get(
      'next',
    )
    const hasSafeNextPath =
      requestedNextPath?.startsWith('/') && !requestedNextPath.startsWith('//')

    if (hasSafeNextPath && requestedNextPath) {
      setExplicitNextPath(requestedNextPath)
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    try {
      const res = await register({
        variables: { email, password },
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
      const message = getFriendlyErrorMessage(err, 'Registration failed')
      setError(message)
    }
  }

  return (
    <HStack align="stretch" gap={0} minH="100vh" w="full">
      <RegisterMarketingPanel />

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
                Create your account
              </Heading>
              <Text mt={2} color="muted" fontSize="sm">
                Start your journey with HandyBox today.
              </Text>
            </Box>

            <HStack gap={3} align="stretch">
              <Button
                type="button"
                flex={1}
                variant="outline"
                borderRadius="lg"
                borderWidth="2px"
                borderColor={
                  role === 'homeowner' ? 'primary.500' : 'outlineVariant'
                }
                bg={
                  role === 'homeowner' ? 'primary.50' : 'surfaceContainerLowest'
                }
                color={role === 'homeowner' ? 'primary.700' : 'fg'}
                fontWeight={700}
                py={6}
                h="auto"
                onClick={() => setRole('homeowner')}
                _hover={{
                  bg:
                    role === 'homeowner'
                      ? 'primary.100'
                      : 'surfaceContainerLow',
                }}
              >
                <Stack gap={2} align="center" w="full">
                  <Box color={role === 'homeowner' ? 'primary.600' : 'muted'}>
                    <IconHouse />
                  </Box>
                  <Box as="span">Homeowner</Box>
                </Stack>
              </Button>
              <Button
                type="button"
                flex={1}
                variant="outline"
                borderRadius="lg"
                borderWidth="2px"
                borderColor={
                  role === 'professional' ? 'primary.500' : 'outlineVariant'
                }
                bg={
                  role === 'professional'
                    ? 'primary.50'
                    : 'surfaceContainerLowest'
                }
                color={role === 'professional' ? 'primary.700' : 'fg'}
                fontWeight={700}
                py={6}
                h="auto"
                onClick={() => setRole('professional')}
                _hover={{
                  bg:
                    role === 'professional'
                      ? 'primary.100'
                      : 'surfaceContainerLow',
                }}
              >
                <Stack gap={2} align="center" w="full">
                  <Box
                    color={role === 'professional' ? 'primary.600' : 'muted'}
                  >
                    <IconTools />
                  </Box>
                  <Box as="span">Professional</Box>
                </Stack>
              </Button>
            </HStack>

            <Box as="form" onSubmit={onSubmit}>
              <Stack gap={4}>
                <FormField label="Full Name">
                  <Input
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="outlineVariant"
                  />
                </FormField>

                <FormField label="Email Address">
                  <InputGroup startElement={<FieldIconMail />}>
                    <Input
                      placeholder="name@company.com"
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

                <HStack
                  gap={4}
                  align="flex-start"
                  flexDir={{ base: 'column', sm: 'row' }}
                >
                  <FormField
                    label="Password"
                    flex={1}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    <InputGroup
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
                    >
                      <Input
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor="outlineVariant"
                      />
                    </InputGroup>
                  </FormField>
                  <FormField
                    label="Confirm"
                    flex={1}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    <InputGroup
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
                    >
                      <Input
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor="outlineVariant"
                      />
                    </InputGroup>
                  </FormField>
                </HStack>

                <Checkbox.Root
                  checked={agreedToTerms}
                  onCheckedChange={(detail) =>
                    setAgreedToTerms(Boolean(detail.checked))
                  }
                  colorPalette="blue"
                >
                  <Checkbox.HiddenInput />
                  <HStack gap={3} align="flex-start">
                    <Checkbox.Control
                      mt={0.5}
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
                    <Checkbox.Label
                      fontSize="sm"
                      fontWeight={500}
                      color="fg"
                      lineHeight="1.5"
                    >
                      I agree to the{' '}
                      <Link
                        as={NextLink}
                        href="/login"
                        fontWeight={700}
                        color="primary.600"
                        _hover={{ color: 'primary.700' }}
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        as={NextLink}
                        href="/register"
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

                {error ? (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                ) : null}

                <Button
                  type="submit"
                  loading={loading}
                  w="full"
                  borderRadius="full"
                  size="lg"
                  boxShadow="0 8px 20px rgba(26, 86, 219, 0.25)"
                >
                  Create Account
                </Button>
              </Stack>
            </Box>

            <Box pt={2} borderTopWidth="1px" borderColor="outlineVariant">
              <Text fontSize="sm" color="muted" textAlign="center">
                Already have an account?{' '}
                <Link
                  as={NextLink}
                  href="/login"
                  fontWeight={700}
                  color="primary.600"
                  _hover={{ color: 'primary.700', textDecoration: 'none' }}
                >
                  Log In
                </Link>
              </Text>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </HStack>
  )
}

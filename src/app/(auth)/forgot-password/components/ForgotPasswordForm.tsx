'use client'

import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Button, FormField, Input, Logo } from '@ui'
import NextLink from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'

import {
  FieldIconMail,
  IconArrowRight,
  IconLockReset,
} from './ForgotPasswordIcons'

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = useMemo(
    () => searchParams.get('email')?.trim() ?? '',
    [searchParams],
  )
  const [email, setEmail] = useState(initialEmail)

  const { requestReset, loading, message, cooldownSeconds, canResend } =
    useForgotPassword()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await requestReset(email)
    if (!result || result.rateLimited) return

    router.push(
      `/forgot-password/sent?email=${encodeURIComponent(email.trim())}`,
    )
  }

  return (
    <Stack gap={6} w="full">
      <Link
        as={NextLink}
        href="/"
        _hover={{ textDecoration: 'none', opacity: 0.92 }}
      >
        <Logo h="48px" />
      </Link>

      <Box
        w="full"
        bg="neutral.100"
        borderRadius="xl"
        boxShadow="card"
        borderTopWidth="4px"
        borderTopColor="primary.500"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
      >
        <Stack gap={6} align="center" textAlign="center">
          <Box
            boxSize={14}
            borderRadius="full"
            bg="primary.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconLockReset />
          </Box>

          <Box>
            <Heading size="xl" color="cardFg">
              Forgot Password?
            </Heading>
            <Text
              mt={2}
              color="formLabelMuted"
              fontSize="sm"
              maxW="xs"
              mx="auto"
            >
              Enter your email and we&apos;ll send reset instructions if an
              account exists.
            </Text>
          </Box>

          <Box as="form" onSubmit={onSubmit} w="full" textAlign="left">
            <Stack gap={4}>
              <FormField label="Email Address">
                <Input
                  startElement={<FieldIconMail />}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  type="email"
                  autoComplete="email"
                  required
                  rootProps={{ minH: '48px', w: 'full' }}
                />
              </FormField>

              {message ? (
                <Text role="alert" color="red.500" fontSize="sm">
                  {message}
                </Text>
              ) : null}

              <Button
                type="submit"
                loading={loading}
                disabled={!canResend || !email.trim()}
                w="full"
                borderRadius="full"
                size="lg"
              >
                {cooldownSeconds > 0
                  ? `Send again in ${cooldownSeconds}s`
                  : 'Send Reset Link'}
                <IconArrowRight />
              </Button>
            </Stack>
          </Box>

          <Link
            as={NextLink}
            href="/login"
            fontSize="sm"
            fontWeight={700}
            color="primary.600"
            _hover={{ color: 'primary.700', textDecoration: 'none' }}
          >
            ← Back to Login
          </Link>
        </Stack>
      </Box>

      <Text fontSize="sm" color="formLabelMuted" textAlign="center">
        Facing issues?{' '}
        <Link
          as={NextLink}
          href="/"
          fontWeight={700}
          color="secondary.600"
          _hover={{ color: 'secondary.700', textDecoration: 'none' }}
        >
          Contact Support
        </Link>
      </Text>
    </Stack>
  )
}

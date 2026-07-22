'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Button, Link, Logo } from '@ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo, useRef } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { usePageI11n } from '@/i18n/usePageI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import bag from './i11n.json'

function VerifyEmailSentFallback() {
  const t = usePageI11n(bag)

  return (
    <Box minH="40vh" display="flex" alignItems="center" justifyContent="center">
      <Text color="text.muted">{t.loading}</Text>
    </Box>
  )
}

function VerifyEmailSentContent() {
  const t = usePageI11n(bag)
  const router = useRouter()
  const searchParams = useSearchParams()
  const me = useMe()
  const { resend, isSending, message, isSent } = useResendVerificationEmail()

  const nextPath = useMemo(() => {
    const next = searchParams.get('next')?.trim() ?? ''
    if (next.startsWith('/') && !next.startsWith('//')) return next
    return null
  }, [searchParams])

  const isLoggedIn = Boolean(getAuthToken())
  const redirectedRef = useRef(false)

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current) return
      if (me && isEmailVerified(me)) {
        redirectedRef.current = true
        router.replace(nextPath ?? APP_HOME)
      }
    },
    [me, nextPath, router],
  )

  if (me && isEmailVerified(me)) {
    return (
      <Text color="text.muted" fontSize="sm">
        {t.redirecting}
      </Text>
    )
  }

  return (
    <Stack ref={onMountRef} gap={6} w="full">
      <Link
        href="/"
        display="block"
        w="full"
        _hover={{ textDecoration: 'none', opacity: 0.92 }}
      >
        <Logo h="48px" />
      </Link>

      <Box
        w="full"
        bg="bg.subtle"
        borderRadius="2xl"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
      >
        <Stack gap={5} align="center" textAlign="center">
          <Heading size="xl" color="text.default">
            {t.title}
          </Heading>
          <Text color="text.muted" fontSize="sm" lineHeight="1.6">
            {t.descriptionPrefix}{' '}
            {me?.email ? (
              <Text as="span" fontWeight={700} color="text.default">
                {me.email}
              </Text>
            ) : (
              t.descriptionFallbackEmail
            )}
            . {t.descriptionSuffix}
          </Text>

          {isLoggedIn ? (
            <Stack gap={3} w="full" maxW="xs">
              <Button
                loading={isSending}
                onClick={() => void resend()}
                w="full"
              >
                {t.resend}
              </Button>
              {message ? (
                <Box
                  as="output"
                  fontSize="sm"
                  color={isSent ? 'status.success.fg' : 'status.danger.fg'}
                >
                  {message}
                </Box>
              ) : null}
              <Link
                href={nextPath ?? APP_HOME}
                fontSize="sm"
                fontWeight={600}
                color="text.link"
                _hover={{ textDecoration: 'none', color: 'status.success.fg' }}
              >
                {t.continue}
              </Link>
            </Stack>
          ) : (
            <Stack gap={2}>
              <Text fontSize="sm" color="text.muted">
                {t.loginPrompt}
              </Text>
              <Link
                href={`/login?next=${encodeURIComponent('/verify-email/sent')}`}
                _hover={{ textDecoration: 'none' }}
              >
                <Button w="full">{t.login}</Button>
              </Link>
            </Stack>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<VerifyEmailSentFallback />}>
      <VerifyEmailSentContent />
    </Suspense>
  )
}

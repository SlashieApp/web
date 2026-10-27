'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { useI11n } from '@/i18n/useI11n'
import { MARKETING_HOME } from '@/utils/appRoutes'
import { Link, Logo } from '@ui'

import bag from '../i11n.json'
import { AuthBackButton } from './AuthBackButton'

/** Every auth page: the logo with a way back, one centred column, and the legal links. */
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useI11n(bag).shell

  return (
    <Stack
      w="full"
      maxW="28rem"
      mx="auto"
      flex={1}
      px={4}
      py={{ base: 8, md: 12 }}
      gap={{ base: 6, lg: 8 }}
    >
      <Box position="relative" display="flex" justifyContent="center">
        <AuthBackButton />
        <Link
          href={MARKETING_HOME}
          aria-label={t.home}
          _hover={{ opacity: 0.92 }}
        >
          <Logo h="36px" />
        </Link>
      </Box>
      <Stack as="main" flex={1} justify="center" w="full" minW={0}>
        {children}
      </Stack>
      <HStack
        as="nav"
        aria-label={t.legalAria}
        justify="center"
        gap={5}
        fontSize="sm"
      >
        <Link href="/terms" color="text.muted">
          {t.terms}
        </Link>
        <Link href="/privacy" color="text.muted">
          {t.privacy}
        </Link>
        <Link href={`mailto:${LEGAL_CONTACT_EMAIL}`} color="text.muted">
          {t.contact}
        </Link>
      </HStack>
    </Stack>
  )
}

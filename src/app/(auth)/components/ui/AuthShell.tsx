'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { useI11n } from '@/i18n/useI11n'
import { STATUS_CARD_MAX_W } from '@/theme/pageContainer'
import { MARKETING_HOME } from '@/utils/appRoutes'
import { Link, Logo, PageContainer } from '@ui'

import bag from '../i11n.json'
import { AuthBackButton } from './AuthBackButton'

/**
 * Every auth page: the logo with a way back, one centred column, and the legal
 * links. The column is the status card width (R6, `STATUS_CARD_MAX_W`) and the
 * page gutters sit outside it, so the auth card is the same width as every
 * other centred card.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useI11n(bag).shell

  return (
    <PageContainer display="flex" flexDirection="column" flex={1}>
      <Stack
        w="full"
        maxW={STATUS_CARD_MAX_W}
        mx="auto"
        flex={1}
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
    </PageContainer>
  )
}

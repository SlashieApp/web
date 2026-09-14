'use client'

import { Box, Text } from '@chakra-ui/react'

import { useAccountDisabled } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import bag from './i11n.json'

const ACCOUNTS_MAILTO = 'mailto:accounts@slashie.app'

/**
 * Persistent top strip for disabled accounts. Mounted on Header and step-flow
 * chrome so it stays visible on every authenticated layout.
 */
export function SuspensionBanner() {
  const t = useI11n(bag).suspension
  const disabled = useAccountDisabled()

  if (!disabled) return null

  return (
    <Box
      as="section"
      aria-label={t.ariaLabel}
      bg="status.danger.soft"
      borderBottomWidth="1px"
      borderColor="status.danger.fg"
      px={{ base: 3, lg: 4 }}
      py={2}
      flexShrink={0}
    >
      <Text fontSize="sm" color="status.danger.fg" fontWeight={600}>
        {t.before}
        <Link
          href={ACCOUNTS_MAILTO}
          fontSize="sm"
          fontWeight={700}
          color="text.link"
          _hover={{ color: 'status.danger.fg', textDecoration: 'underline' }}
        >
          {t.email}
        </Link>
        {t.after}
      </Text>
    </Box>
  )
}

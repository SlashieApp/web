'use client'

import { Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import bag from '../i11n.json'

/**
 * The one consent line above the ways in (FE-563 on Sign up, FE-570 on Log
 * in): 18 or over, and the Terms and Privacy Policy. Going on from a screen
 * that shows it sends `consent` with the Terms version (BE-128), so the line
 * and what is recorded stay together.
 */
export function ConsentLine() {
  const t = useI11n(bag).consent
  const [before, middle = '', after = ''] = t.line.split(
    /\{terms\}|\{privacy\}/,
  )
  return (
    <Text
      fontSize="sm"
      color="text.muted"
      lineHeight="tall"
      data-consent-line=""
    >
      {before}
      <Link href="/terms" fontWeight={500} color="text.link">
        {t.terms}
      </Link>
      {middle}
      <Link href="/privacy" fontWeight={500} color="text.link">
        {t.privacy}
      </Link>
      {after}
    </Text>
  )
}

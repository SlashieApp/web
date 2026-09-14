'use client'

import { Text } from '@chakra-ui/react'
import { LuShieldCheck } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'

import { InfoBar } from '../InfoBar/InfoBar'
import { Link } from '../Link/Link'
import bag from './i11n.json'

export type SafetyNoticeVariant = 'inline' | 'panel' | 'complete'

export type SafetyNoticeProps = {
  variant?: SafetyNoticeVariant
}

/**
 * C2C pay + meet-safely reminder. `inline` is the one-liner for accept/complete
 * surfaces; `panel` is the fuller trust card; `complete` is the worker close-job
 * line.
 */
export function SafetyNotice({ variant = 'inline' }: SafetyNoticeProps) {
  const t = useI11n(bag)

  if (variant === 'panel') {
    return (
      <InfoBar
        tone="info"
        icon={<LuShieldCheck size={20} />}
        hideBadge
        heading={t.heading}
        linkLabel={t.linkLabel}
        linkHref={SAFETY_HREF}
      >
        {t.body}
      </InfoBar>
    )
  }

  const line = variant === 'complete' ? t.completeOneLiner : t.oneLiner
  return (
    <Text fontSize="sm" color="text.muted" lineHeight="tall">
      {line}{' '}
      <Link href={SAFETY_HREF} tone="emphasis" fontWeight={600}>
        {t.linkLabel}
      </Link>
    </Text>
  )
}

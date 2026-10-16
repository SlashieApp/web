'use client'

import { Text } from '@chakra-ui/react'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import type { AppLocale } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'

/** Free quotes reset on the 1st of next month (UTC), as Plan & billing says. */
function resetDate(now: Date, locale: AppLocale): string {
  const reset = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  )
  return new Intl.DateTimeFormat(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(reset)
}

/** Shown in the quote flow once a free worker has used this month's quotes. */
export function QuoteLimitPaywall({ now = new Date() }: { now?: Date }) {
  const t = useI11n(bag).quoteLimit
  const locale = useLocale()

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} heading={t.heading}>
      <Text color="text.muted">
        {formatMessage(t.body, { date: resetDate(now, locale) })}
      </Text>
      <Button asChild size="sm" w="full">
        <Link href="/billing" _hover={{ textDecoration: 'none' }}>
          {t.action}
        </Link>
      </Button>
    </Card>
  )
}

import NextLink from 'next/link'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n } from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'
import { APP_HOME, MARKETING_HOME } from '@/utils/appRoutes'
import { Button } from '@ui'

import { StatusScreen } from './StatusScreen'
import messages from './i11n.json'

/** Any unknown URL (FE-72: replaces Next's unbranded default 404). */
export default async function NotFound() {
  const locale = await getRequestLocale()
  const t = loadPageI11n(messages, locale)
  return (
    <StatusScreen
      code={t.notFoundCode}
      title={t.notFoundTitle}
      body={t.notFoundBody}
      actions={
        <>
          <Button asChild variant="primary">
            <NextLink href={withLocale(locale, APP_HOME)}>{t.search}</NextLink>
          </Button>
          <Button asChild variant="ghost">
            <NextLink href={withLocale(locale, MARKETING_HOME)}>
              {t.home}
            </NextLink>
          </Button>
        </>
      }
    />
  )
}

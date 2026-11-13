import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@/ui'
import reportMessages from '@/ui/ReportDialog/i11n.json'

import marketingMessages from '../../i11n.json'
import { SafetyScreen } from './components/SafetyScreen'
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/help/safety' })
}

export default async function SafetyHelpPage() {
  const locale = await getRequestLocale()

  return (
    <>
      <SafetyScreen
        document={loadPageI11n(messages, locale)}
        phone={loadPageI11n(marketingMessages, locale).landing.phone}
        report={loadPageI11n(reportMessages, locale)}
      />
      <Footer variant="minimal" />
    </>
  )
}

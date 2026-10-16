import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@ui'

import marketingMessages from '../i11n.json'
import { AboutScreen } from './components/AboutScreen'
import messages from './i11n.json'
import { getAboutView } from './views'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/about' })
}

export default async function AboutPage() {
  const locale = await getRequestLocale()
  const session = (await getHasAuthSession()) ? 'signedIn' : 'guest'

  return (
    <>
      <AboutScreen
        copy={loadPageI11n(messages, locale)}
        ctas={loadPageI11n(marketingMessages, locale).common.ctas}
        view={getAboutView({ session })}
        locale={locale}
      />
      <Footer />
    </>
  )
}

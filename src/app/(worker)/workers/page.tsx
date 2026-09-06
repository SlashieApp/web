import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import { WorkersScreen } from './components/WorkersScreen'
import {
  type WorkersPageSearchParams,
  parseWorkersUrlState,
} from './helpers/workersQueryParams'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/workers' })
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<WorkersPageSearchParams>
}) {
  const params = await searchParams
  return <WorkersScreen initialUrlState={parseWorkersUrlState(params)} />
}

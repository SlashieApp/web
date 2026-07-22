import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { SearchScreen } from './components/SearchScreen'
import {
  type SearchPageSearchParams,
  parseSearchUrlState,
} from './helpers/searchQueryParams'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/search' })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageSearchParams>
}) {
  const params = await searchParams
  return <SearchScreen initialUrlState={parseSearchUrlState(params)} />
}

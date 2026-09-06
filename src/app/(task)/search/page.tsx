import { redirect } from 'next/navigation'

import {
  buildWorkersUrl,
  parseWorkersUrlState,
} from '@/app/(worker)/workers/helpers/workersQueryParams'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'

import { SearchScreen } from './components/SearchScreen'
import {
  type SearchPageSearchParams,
  firstSearchParam,
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
  const locale = await getRequestLocale()

  if (firstSearchParam(params.mode) === 'workers') {
    redirect(
      withLocale(
        locale,
        buildWorkersUrl(
          parseWorkersUrlState({
            ...params,
            q: firstSearchParam(params.wq) ?? firstSearchParam(params.q),
          }),
        ),
      ),
    )
  }

  return <SearchScreen initialUrlState={parseSearchUrlState(params)} />
}

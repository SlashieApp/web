import type { Metadata } from 'next'

import { SearchScreen } from './components/SearchScreen'
import {
  type SearchPageSearchParams,
  parseSearchUrlState,
} from './helpers/searchQueryParams'

export const metadata: Metadata = {
  title: 'Search | Slashie',
  description:
    'Search the map for local tasks to quote on, or workers to hire — one map-first search across the Slashie marketplace.',
  alternates: { canonical: '/search' },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageSearchParams>
}) {
  const params = await searchParams
  return <SearchScreen initialUrlState={parseSearchUrlState(params)} />
}

'use client'

import { Box, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { EVENTS, capture } from '@/utils/analytics'
import { buildTaskFilter } from '@/utils/taskListQuery'

import { buildMyTasksHub } from '../helpers/myTasksHub'
import {
  EMPTY_MY_TASKS_QUERY,
  type MyTasksQuery,
  activeFilterCount,
  countHubRows,
  filterHubByRole,
  hubCategoryOptions,
  hubHasBothRoles,
  myTasksQueryString,
  parseMyTasksQuery,
} from '../helpers/myTasksHubFilters'
import { quoteBlocker } from '../helpers/quoteBlocker'
import { useMyTaskCategories } from '../helpers/useMyTaskCategories'
import bag from '../i11n.json'
import { MY_TASKS_VIEWS, getMyTasksView } from '../views'
import { MyTasksFilters } from './ui/MyTasksFilters'
import { MY_TASKS_RAIL_W, MyTasksFiltersRail } from './ui/MyTasksFiltersRail'
import { MyTasksList } from './ui/MyTasksList'
import { MyTasksQuoteBlocker } from './ui/MyTasksQuoteBlocker'

/** The list column's width (Chakra `2xl`), and the gap between it and the rail. */
const LIST_W = '42rem'
const RAIL_GAP = '2rem'

/**
 * One centred column, as wide as the list. From `lg` up it also holds the rail
 * and the gap, so the list keeps the width it had before the rail.
 */
const PAGE_MAX_W = {
  base: LIST_W,
  lg: `calc(${MY_TASKS_RAIL_W} + ${RAIL_GAP} + ${LIST_W})`,
} as const

/**
 * My Tasks hub at `/tasks` (views/README.md), like Uber's Activity screen:
 * your posted tasks and quotes in Upcoming, Open and Past, under a "Before
 * you can quote" strip when something blocks a worker from quoting. Search,
 * Show (posted or quoted) and Category are kept in the URL
 * (`?q=&category=&role=`) and shared by both filter layouts: from `lg` up an
 * always-open rail left of the list (`MyTasksFiltersRail`), below it the
 * filter icon by the title with its drawer (`MyTasksFilters`). Each layout
 * hides itself with CSS, so resizing keeps the filters.
 */
export function MyTasksScreen() {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const searchParams = useSearchParams()
  const trackedRef = useRef(false)

  const [query, setQuery] = useState<MyTasksQuery>(() =>
    parseMyTasksQuery(searchParams),
  )

  const applyQuery = useCallback(
    (next: MyTasksQuery) => {
      setQuery(next)
      router.replace(`${localize('/tasks')}${myTasksQueryString(next)}`, {
        scroll: false,
      })
    },
    [localize, router],
  )

  const blocker = quoteBlocker(useUserStore((s) => s.me))
  const requests = useMyRequests()
  const quotes = useMyQuotes()
  const orders = useAccountOrders()
  const categoryCodes = useMyTaskCategories()

  const listVariables = useMemo(() => {
    const filter = buildTaskFilter({
      search: query.q,
      category: query.category,
    })
    return filter ? { filter } : undefined
  }, [query.category, query.q])
  const filteredRequests = useMyRequests(listVariables)
  const filteredQuotes = useMyQuotes(listVariables)

  const userId = requests.me?.id ?? quotes.me?.id ?? orders.me?.id
  const allSections = useMemo(
    () =>
      buildMyTasksHub({
        posted: requests.postedTasks,
        sentQuotes: quotes.sentQuotes,
        orders: orders.orders,
        userId,
      }),
    [orders.orders, quotes.sentQuotes, requests.postedTasks, userId],
  )
  const visibleSections = useMemo(() => {
    const searched = listVariables
      ? buildMyTasksHub({
          posted: filteredRequests.postedTasks,
          sentQuotes: filteredQuotes.sentQuotes,
          orders: orders.orders,
          userId,
        })
      : allSections
    return filterHubByRole(searched, query.role)
  }, [
    allSections,
    filteredQuotes.sentQuotes,
    filteredRequests.postedTasks,
    listVariables,
    orders.orders,
    query.role,
    userId,
  ])

  const hasTasks = countHubRows(allSections) > 0
  const visibleCount = countHubRows(visibleSections)
  const firstLoad =
    !hasTasks && (requests.loading || quotes.loading || orders.loading)
  const searchLoading =
    Boolean(listVariables) &&
    (filteredRequests.loading || filteredQuotes.loading)
  const errorMessage =
    requests.errorMessage ||
    quotes.errorMessage ||
    orders.errorMessage ||
    (listVariables
      ? filteredRequests.errorMessage || filteredQuotes.errorMessage
      : null)
  const filtered = activeFilterCount(query) > 0
  const config =
    MY_TASKS_VIEWS[
      getMyTasksView({
        hasTasks,
        hasMatches: visibleCount > 0,
        loading: firstLoad || searchLoading,
        failed: Boolean(errorMessage),
        filtered,
      })
    ]
  // From `lg` up, the first load keeps the rail's room so the list does not
  // jump right when the rail appears. A message with nothing to filter
  // (no tasks, a failed load) has no rail and uses the full width.
  const railRoom = !config.search && config.body === 'skeleton'

  const categories = useMemo(
    () => hubCategoryOptions(categoryCodes.hubTaskCategories),
    [categoryCodes.hubTaskCategories],
  )
  const showRole = hubHasBothRoles(allSections)

  const onMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.my_tasks_view)
  }, [])

  const onRetry = useCallback(() => {
    void requests.refetch()
    void quotes.refetch()
    void filteredRequests.refetch()
    void filteredQuotes.refetch()
    void orders.refetch()
    void categoryCodes.refetch()
  }, [
    categoryCodes,
    filteredQuotes,
    filteredRequests,
    orders,
    quotes,
    requests,
  ])

  const clearAll = useCallback(
    () => applyQuery(EMPTY_MY_TASKS_QUERY),
    [applyQuery],
  )

  return (
    <AccountAuthGate>
      <Box ref={onMountRef} bg="bg.canvas" minH="100%">
        <Stack
          gap={4}
          w="full"
          maxW={PAGE_MAX_W}
          mx="auto"
          px={PAGE_GUTTER_X}
          py={{ base: 4, md: 6 }}
        >
          <Stack gap={1}>
            <HStack justify="space-between" align="center" gap={3}>
              <Heading as="h1" size="lg" color="text.default" minW={0}>
                {t.title}
              </Heading>
              {config.search ? (
                <MyTasksFilters
                  query={query}
                  categories={categories}
                  showRole={showRole}
                  onApply={applyQuery}
                />
              ) : null}
            </HStack>
            <Text fontSize="sm" color="text.muted" lineHeight="1.5">
              {t.description}
            </Text>
          </Stack>

          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align={{ base: 'stretch', lg: 'flex-start' }}
            gap={{ base: 4, lg: RAIL_GAP }}
          >
            {config.search ? (
              <MyTasksFiltersRail
                query={query}
                categories={categories}
                showRole={showRole}
                onChange={applyQuery}
              />
            ) : null}
            {railRoom ? (
              <Box
                display={{ base: 'none', lg: 'block' }}
                w={MY_TASKS_RAIL_W}
                flexShrink={0}
              />
            ) : null}

            <Stack gap={4} flex={{ lg: 1 }} minW={0} maxW={{ lg: LIST_W }}>
              {blocker ? <MyTasksQuoteBlocker blocker={blocker} /> : null}

              {config.body === 'groups' ? (
                <Text srOnly aria-live="polite">
                  {formatMessage(
                    visibleCount === 1
                      ? t.filters.resultCountOne
                      : t.filters.resultCount,
                    { count: visibleCount },
                  )}
                </Text>
              ) : null}
              <MyTasksList
                config={config}
                sections={visibleSections}
                filtered={filtered}
                errorMessage={errorMessage}
                onRetry={onRetry}
                onClearFilters={clearAll}
              />
            </Stack>
          </Flex>
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}

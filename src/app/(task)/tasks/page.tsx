'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { publicProfileAchievementsPath } from '@/app/helpers/publicProfilePath'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { EVENTS, capture } from '@/utils/analytics'
import { buildTaskFilter } from '@/utils/taskListQuery'

import { MyTasksAchievements } from './components/ui/MyTasksAchievements'
import {
  MyTasksFilterEmpty,
  MyTasksFilters,
} from './components/ui/MyTasksFilters'
import { MyTasksList } from './components/ui/MyTasksList'
import {
  type MyTasksMobileView,
  MyTasksViewSwitch,
} from './components/ui/MyTasksViewSwitch'
import { buildMyTasksHub } from './helpers/myTasksHub'
import {
  type HubSectionFilter,
  collectHubOwners,
  countHubRows,
  hubCategoryOptions,
  isHubFilterActive,
} from './helpers/myTasksHubFilters'
import {
  achievementRoleVisibility,
  buildAchievementPanels,
} from './helpers/taskAchievements'
import { useMyTaskAchievements } from './helpers/useMyTaskAchievements'
import bag from './i11n.json'

/**
 * My Tasks hub at `/tasks`.
 *
 * Auth: AccountAuthGate redirects guests to login.
 * Data: useMyRequests (hosted) · useMyQuotes (quoted) · useAccountOrders (booked/completed dates).
 * Search/filter: `TaskFilter.search`, `ownerUserId`, `category`, and `hubSection`
 * on the hosted and quoted list queries. `me.hubTaskCategories` fills the category menu.
 * Your activity: desktop sticky rail, mobile corner switch. Worker and
 * customer panels stay separate and read `me.taskAchievements`.
 * More opens `/profile/[ownUserId]#achievements`.
 * The compact corner switch still toggles the list and this summary.
 * States: loading skeleton, error + retry, empty with post/browse, filter miss, sectioned list.
 * Cards navigate to `/tasks/[id]` — they do not expand in place.
 */
export default function MyTasksPage() {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const trackedRef = useRef(false)

  const requests = useMyRequests()
  const quotes = useMyQuotes()
  const orders = useAccountOrders()
  const achievements = useMyTaskAchievements()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [ownerUserId, setOwnerUserId] = useState('')
  const [category, setCategory] = useState('')
  const [hubSection, setHubSection] = useState<HubSectionFilter | ''>('')
  const [mobileView, setMobileView] = useState<MyTasksMobileView>('tasks')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const listVariables = useMemo(() => {
    const filter = buildTaskFilter({
      search,
      category,
      ownerUserId,
      hubSection: hubSection ? [hubSection] : undefined,
    })
    return filter ? { filter } : undefined
  }, [category, hubSection, ownerUserId, search])

  const filteredRequests = useMyRequests(listVariables)
  const filteredQuotes = useMyQuotes(listVariables)

  const userId = requests.me?.id ?? quotes.me?.id ?? orders.me?.id
  const sections = useMemo(
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
    if (!listVariables) return sections
    return buildMyTasksHub({
      posted: filteredRequests.postedTasks,
      sentQuotes: filteredQuotes.sentQuotes,
      orders: orders.orders,
      userId,
    })
  }, [
    filteredQuotes.sentQuotes,
    filteredRequests.postedTasks,
    listVariables,
    orders.orders,
    sections,
    userId,
  ])

  const filterActive = isHubFilterActive({
    search: searchInput,
    ownerUserId,
    category,
    hubSection,
  })
  // Owner options stay on the unfiltered hub. Categories come from
  // `me.hubTaskCategories`, which the API keeps stable while filters change.
  const owners = useMemo(() => {
    return collectHubOwners(sections, userId).map((owner) => ({
      ownerUserId: owner.ownerUserId,
      label:
        owner.label ||
        (owner.ownerUserId === userId ? t.filters.you : t.filters.ownerUnknown),
    }))
  }, [sections, t.filters.ownerUnknown, t.filters.you, userId])
  const categories = useMemo(
    () => hubCategoryOptions(achievements.hubTaskCategories),
    [achievements.hubTaskCategories],
  )

  const roles = achievementRoleVisibility({
    hasWorkerProfile: achievements.hasWorkerProfile,
    sentQuoteCount: quotes.sentQuotes.length,
    postedTaskCount: requests.postedTasks.length,
    workerHasActivity: achievements.worker?.hasActivity,
    customerHasActivity: achievements.customer?.hasActivity,
  })
  const panels = useMemo(
    () =>
      buildAchievementPanels({
        showWorker: roles.worker,
        showCustomer: roles.customer,
        worker: achievements.worker,
        customer: achievements.customer,
        quoteAllowance: achievements.quoteAllowance,
      }),
    [
      achievements.customer,
      achievements.quoteAllowance,
      achievements.worker,
      roles.customer,
      roles.worker,
    ],
  )
  const showAchievements = achievements.loading || panels.length > 0
  const achievementsView = showAchievements && mobileView === 'achievements'

  const loading = requests.loading || quotes.loading || orders.loading
  const filtering =
    Boolean(listVariables) &&
    (filteredRequests.loading || filteredQuotes.loading)
  const initialLoading = loading && countHubRows(sections) === 0
  const errorMessage =
    requests.errorMessage ||
    quotes.errorMessage ||
    orders.errorMessage ||
    (listVariables
      ? filteredRequests.errorMessage || filteredQuotes.errorMessage
      : null)
  const hubEmpty = countHubRows(sections) === 0
  const visibleEmpty = countHubRows(visibleSections) === 0
  const visibleCount = countHubRows(visibleSections)

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
    void achievements.refetch()
  }, [achievements, filteredQuotes, filteredRequests, orders, quotes, requests])

  const onOpen = useCallback(
    (taskId: string) => {
      router.push(localize(`/tasks/${taskId}`))
    },
    [localize, router],
  )

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value.trim())
    }, 300)
  }, [])

  const clearFilters = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    setSearchInput('')
    setSearch('')
    setOwnerUserId('')
    setCategory('')
    setHubSection('')
  }, [])

  return (
    <AccountAuthGate>
      <Box ref={onMountRef} bg="bg.canvas" minH="100%">
        <Stack
          gap={4}
          w="full"
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          px={PAGE_GUTTER_X}
          py={{ base: 4, md: 6 }}
        >
          <Stack
            direction="row"
            justify="space-between"
            align="flex-start"
            gap={3}
          >
            <Stack gap={1} minW={0}>
              <Heading as="h1" size="lg" color="text.default">
                {t.title}
              </Heading>
              <Text fontSize="sm" color="text.muted" lineHeight="1.5">
                {t.description}
              </Text>
            </Stack>
            {showAchievements ? (
              <MyTasksViewSwitch view={mobileView} onChange={setMobileView} />
            ) : null}
          </Stack>

          <Box
            display={{
              base: achievementsView ? 'none' : 'grid',
              lg: 'grid',
            }}
            gridTemplateColumns={{
              base: '1fr',
              lg: 'minmax(0, 1fr) minmax(18rem, 22rem)',
            }}
            gap={{ base: 4, lg: 6 }}
            alignItems="start"
          >
            <Stack gap={4} minW={0}>
              {!hubEmpty ? (
                <MyTasksFilters
                  search={searchInput}
                  onSearchChange={onSearchChange}
                  ownerUserId={ownerUserId}
                  onOwnerChange={setOwnerUserId}
                  owners={owners}
                  category={category}
                  onCategoryChange={setCategory}
                  categories={categories}
                  hubSection={hubSection}
                  onHubSectionChange={setHubSection}
                  active={filterActive}
                  onClear={clearFilters}
                />
              ) : null}
              {initialLoading ? null : (
                <Text srOnly aria-live="polite">
                  {formatMessage(
                    visibleCount === 1
                      ? t.filters.resultCountOne
                      : t.filters.resultCount,
                    { count: visibleCount },
                  )}
                </Text>
              )}
              {!initialLoading &&
              !filtering &&
              !errorMessage &&
              !hubEmpty &&
              visibleEmpty ? (
                <MyTasksFilterEmpty onClear={clearFilters} />
              ) : (
                <MyTasksList
                  sections={visibleSections}
                  loading={initialLoading || (filtering && visibleEmpty)}
                  errorMessage={errorMessage}
                  onRetry={onRetry}
                  onOpen={onOpen}
                />
              )}
            </Stack>
            {showAchievements ? (
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="sticky"
                top={`calc(${HEADER_MIN_HEIGHT.md} + 1rem)`}
                alignSelf="start"
                zIndex={1}
              >
                <MyTasksAchievements
                  panels={panels}
                  loading={achievements.loading}
                  moreHref={
                    userId ? publicProfileAchievementsPath(userId) : null
                  }
                />
              </Box>
            ) : null}
          </Box>

          {showAchievements ? (
            <Box
              display={{
                base: achievementsView ? 'block' : 'none',
                lg: 'none',
              }}
            >
              <MyTasksAchievements
                panels={panels}
                loading={achievements.loading}
                moreHref={userId ? publicProfileAchievementsPath(userId) : null}
              />
            </Box>
          ) : null}
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}

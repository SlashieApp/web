'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { EVENTS, capture } from '@/utils/analytics'

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
  applyMyTasksHubFilter,
  collectHubOwners,
  collectHubTaskCategories,
  countHubRows,
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
 * Search/filter: title, description, and place, plus owner, category, and
 * Open / Booked / Completed — applied on the loaded hub (BE-61 field names).
 * Achievements: desktop rail, mobile corner switch. Worker and customer panels
 * stay separate; `me.taskAchievements` fills them when that query is enabled.
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

  const [search, setSearch] = useState('')
  const [ownerUserId, setOwnerUserId] = useState('')
  const [category, setCategory] = useState('')
  const [hubSection, setHubSection] = useState<HubSectionFilter | ''>('')
  const [mobileView, setMobileView] = useState<MyTasksMobileView>('tasks')

  const sections = useMemo(
    () =>
      buildMyTasksHub({
        posted: requests.postedTasks,
        sentQuotes: quotes.sentQuotes,
        orders: orders.orders,
        userId: requests.me?.id ?? quotes.me?.id ?? orders.me?.id,
      }),
    [
      orders.me?.id,
      orders.orders,
      quotes.me?.id,
      quotes.sentQuotes,
      requests.me?.id,
      requests.postedTasks,
    ],
  )

  const filter = useMemo(
    () => ({ search, ownerUserId, category, hubSection }),
    [category, hubSection, ownerUserId, search],
  )
  const filterActive = isHubFilterActive(filter)
  const visibleSections = useMemo(
    () => applyMyTasksHubFilter(sections, filter),
    [filter, sections],
  )

  const viewerId = requests.me?.id ?? quotes.me?.id ?? orders.me?.id
  const owners = useMemo(() => {
    return collectHubOwners(sections, viewerId).map((owner) => ({
      ownerUserId: owner.ownerUserId,
      label:
        owner.label ||
        (owner.ownerUserId === viewerId
          ? t.filters.you
          : t.filters.ownerUnknown),
    }))
  }, [sections, t.filters.ownerUnknown, t.filters.you, viewerId])
  const categories = useMemo(
    () => collectHubTaskCategories(sections),
    [sections],
  )

  const localQuotesReceived = useMemo(() => {
    let count = 0
    let hosted = false
    for (const section of sections) {
      for (const row of section.rows) {
        if (!row.roles.includes('hosted')) continue
        hosted = true
        count += row.quoteCount
      }
    }
    return hosted ? count : null
  }, [sections])

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
        localQuotesReceived,
      }),
    [
      achievements.customer,
      achievements.quoteAllowance,
      achievements.worker,
      localQuotesReceived,
      roles.customer,
      roles.worker,
    ],
  )
  const showAchievements = achievements.loading || panels.length > 0
  const achievementsView = showAchievements && mobileView === 'achievements'

  const loading = requests.loading || quotes.loading || orders.loading
  const initialLoading = loading && countHubRows(sections) === 0
  const errorMessage =
    requests.errorMessage || quotes.errorMessage || orders.errorMessage
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
    void orders.refetch()
  }, [orders, quotes, requests])

  const onOpen = useCallback(
    (taskId: string) => {
      router.push(localize(`/tasks/${taskId}`))
    },
    [localize, router],
  )

  const clearFilters = useCallback(() => {
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
            gridTemplateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 22rem' }}
            gap={{ base: 4, lg: 6 }}
            alignItems="start"
          >
            <Stack gap={4} minW={0}>
              {!hubEmpty ? (
                <MyTasksFilters
                  search={search}
                  onSearchChange={setSearch}
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
              {!initialLoading && !errorMessage && !hubEmpty && visibleEmpty ? (
                <MyTasksFilterEmpty onClear={clearFilters} />
              ) : (
                <MyTasksList
                  sections={visibleSections}
                  loading={initialLoading}
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
                top={4}
                alignSelf="start"
              >
                <MyTasksAchievements
                  panels={panels}
                  loading={achievements.loading}
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
              />
            </Box>
          ) : null}
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}

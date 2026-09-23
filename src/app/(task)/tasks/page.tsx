'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'

import { AccountAuthGate } from '@/app/(dashboard)/components/layout/AccountAuthGate'
import { useAccountOrders } from '@/app/(dashboard)/helpers/useAccountOrders'
import { useMyQuotes } from '@/app/(dashboard)/helpers/useMyQuotes'
import { useMyRequests } from '@/app/(dashboard)/helpers/useMyRequests'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { EVENTS, capture } from '@/utils/analytics'

import { MyTasksList } from './components/ui/MyTasksList'
import { buildMyTasksHub } from './helpers/myTasksHub'
import bag from './i11n.json'

/**
 * My Tasks hub at `/tasks`.
 *
 * Auth: AccountAuthGate redirects guests to login.
 * Data: useMyRequests (hosted) · useMyQuotes (quoted) · useAccountOrders (booked/completed dates).
 * States: loading skeleton, error + retry, empty with post/browse, sectioned list.
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

  const loading = requests.loading || quotes.loading || orders.loading
  const errorMessage =
    requests.errorMessage || quotes.errorMessage || orders.errorMessage

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
          <Stack gap={1}>
            <Heading as="h1" size="lg" color="text.default">
              {t.title}
            </Heading>
            <Text fontSize="sm" color="text.muted" lineHeight="1.5">
              {t.description}
            </Text>
          </Stack>
          <MyTasksList
            sections={sections}
            loading={loading}
            errorMessage={errorMessage}
            onRetry={onRetry}
            onOpen={onOpen}
          />
        </Stack>
      </Box>
    </AccountAuthGate>
  )
}

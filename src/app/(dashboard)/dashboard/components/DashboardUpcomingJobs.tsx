'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { ScheduleChip } from '@/ui/ScheduleChip'
import {
  orderLocationLabel,
  orderTaskHref,
  scheduleChipForOrder,
} from '@/utils/orderHelpers'
import { Card, Link } from '@ui'

import type { DashboardUpcomingJob } from '../helpers/dashboardOverview'
import bag from '../i11n.json'

export function DashboardUpcomingJobs({
  jobs,
}: {
  jobs: readonly DashboardUpcomingJob[]
}) {
  const t = useI11n(bag)
  const href = useLocalizedHref()
  if (jobs.length === 0) return null

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <Stack gap={1}>
            <Heading size="md" color="text.default">
              {t.upcoming.title}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t.upcoming.description}
            </Text>
          </Stack>
          <Link
            href={href('/quotes')}
            fontSize="sm"
            fontWeight={600}
            color="text.link"
          >
            {t.upcoming.viewAllQuotes}
          </Link>
        </HStack>
        <Stack gap={2}>
          {jobs.slice(0, 5).map((entry) => (
            <Link
              key={entry.id}
              href={href(orderTaskHref(entry.order))}
              display="block"
              p={3}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.default"
              minH="44px"
              _hover={{ textDecoration: 'none', bg: 'bg.subtle' }}
            >
              <HStack justify="space-between" align="flex-start" gap={3}>
                <Stack gap={1} minW={0}>
                  <Text fontWeight={600} truncate>
                    {entry.order.snapshot.title}
                  </Text>
                  <Text fontSize="xs" color="text.muted" truncate>
                    {t.role[entry.roleKey]} · {orderLocationLabel(entry.order)}
                  </Text>
                </Stack>
                <ScheduleChip chip={scheduleChipForOrder(entry.order)} />
              </HStack>
            </Link>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

'use client'

import { Box, HStack, Stack, Text, useBreakpointValue } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Drawer } from '@ui'

import type { AchievementPanel } from '../../helpers/taskAchievements'
import bag from '../../i11n.json'
import {
  ActivityCategoryMix,
  ActivityPaymentNote,
  ActivityStatGrid,
  MyTasksActivityDetails,
} from './MyTasksActivityDetails'

export type MyTasksAchievementsProps = {
  panels: readonly AchievementPanel[]
  loading?: boolean
}

function roleLabel(
  panel: AchievementPanel,
  copy: (typeof bag)['en']['achievements'],
) {
  return panel.role === 'worker' ? copy.worker : copy.customer
}

/**
 * Sticky Your activity rail (desktop) and the mobile achievements tab.
 * More opens a fuller in-hub sheet. It does not leave `/tasks`.
 */
export function MyTasksAchievements({
  panels,
  loading = false,
}: MyTasksAchievementsProps) {
  const t = useI11n(bag)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const compact =
    useBreakpointValue({ base: true, lg: false }, { fallback: 'base' }) ?? true

  // TODO(FE-187, train 2): rewire More to `/profile/[own-user-id]#achievements`.
  // Train 1 keeps the fuller Your activity experience on `/tasks`.
  const openDetails = useCallback(() => {
    setDetailsOpen(true)
  }, [])
  const onDetailsOpenChange = useCallback((open: boolean) => {
    setDetailsOpen(open)
  }, [])

  if (!loading && panels.length === 0) return null

  const showNote = panels.some((panel) => panel.agreedTotalLabel != null)

  return (
    <>
      <Card
        maxW="full"
        p={{ base: 4, md: 5 }}
        aria-label={t.achievements.title}
      >
        <Stack gap={4}>
          <HStack justify="space-between" align="center" gap={3}>
            <Text
              as="h2"
              fontSize="md"
              fontWeight={700}
              color="text.default"
              lineHeight="1.3"
            >
              {t.achievements.title}
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              minH="44px"
              px={2}
              color="text.link"
              fontWeight={600}
              disabled={loading || panels.length === 0}
              aria-label={t.achievements.moreAria}
              aria-expanded={detailsOpen}
              aria-haspopup="dialog"
              onClick={openDetails}
            >
              {t.achievements.more}
            </Button>
          </HStack>
          {loading ? (
            <Stack gap={2} aria-busy="true" aria-live="polite">
              <Text fontSize="sm" color="text.muted">
                {t.achievements.loading}
              </Text>
              <Box h="148px" borderRadius="lg" bg="bg.subtle" />
              <Box h="88px" borderRadius="lg" bg="bg.subtle" />
            </Stack>
          ) : (
            panels.map((panel) => (
              <Stack key={panel.role} gap={3}>
                {panels.length > 1 ? (
                  <Text fontSize="sm" fontWeight={700} color="text.muted">
                    {roleLabel(panel, t.achievements)}
                  </Text>
                ) : null}
                <ActivityStatGrid panel={panel} />
                <ActivityCategoryMix panel={panel} showSharePercent />
                {panel.role === 'worker' && panel.location ? (
                  <Text fontSize="sm" color="text.muted" lineClamp={2}>
                    {t.achievements.mostWorked}: {panel.location}
                  </Text>
                ) : null}
              </Stack>
            ))
          )}
          {!loading && showNote ? <ActivityPaymentNote /> : null}
        </Stack>
      </Card>
      {panels.length > 0 ? (
        <Drawer
          open={detailsOpen}
          onOpenChange={onDetailsOpenChange}
          title={t.achievements.title}
          description={t.achievements.detailDescription}
          placement={compact ? 'bottom' : 'end'}
          size={compact ? 'full' : 'md'}
          contentProps={
            compact
              ? { maxH: 'min(85dvh, 720px)', maxW: 'full', h: 'auto' }
              : { maxW: '28rem' }
          }
        >
          <MyTasksActivityDetails panels={panels} />
        </Drawer>
      ) : null}
    </>
  )
}

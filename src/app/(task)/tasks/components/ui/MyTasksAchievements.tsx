'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import type { AchievementPanel } from '../../helpers/taskAchievements'
import bag from '../../i11n.json'
import {
  ActivityCategoryMix,
  ActivityPaymentNote,
  ActivityStatGrid,
} from './MyTasksActivityDetails'

export type MyTasksAchievementsProps = {
  panels: readonly AchievementPanel[]
  loading?: boolean
  /** Owner public profile, including `#achievements`. */
  moreHref?: string | null
}

function roleLabel(
  panel: AchievementPanel,
  copy: (typeof bag)['en']['achievements'],
) {
  return panel.role === 'worker' ? copy.worker : copy.customer
}

/**
 * Sticky Your activity rail (desktop) and the mobile achievements tab.
 * More leaves `/tasks` for `/profile/[ownUserId]#achievements`.
 * The corner switch still toggles the compact list and this summary.
 */
export function MyTasksAchievements({
  panels,
  loading = false,
  moreHref = null,
}: MyTasksAchievementsProps) {
  const t = useI11n(bag)

  if (!loading && panels.length === 0) return null

  const showNote = panels.some((panel) => panel.agreedTotalLabel != null)

  return (
    <Card maxW="full" p={{ base: 4, md: 5 }} aria-label={t.achievements.title}>
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
          {moreHref ? (
            <Button asChild variant="ghost" size="sm" minH="44px" px={2}>
              <Link
                href={moreHref}
                aria-label={t.achievements.moreAria}
                _hover={{ textDecoration: 'none' }}
              >
                {t.achievements.more}
              </Link>
            </Button>
          ) : null}
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
  )
}

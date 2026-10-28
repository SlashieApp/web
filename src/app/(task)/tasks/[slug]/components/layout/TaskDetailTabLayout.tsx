'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box, Grid, HStack, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import {
  COMPACT_DETAIL_HERO_H,
  MAP_FADE_BOTTOM,
  MAP_FADE_EDGE,
} from '@/app/(task)/helpers/marketplaceMap'
import { WEB_MIN_PX } from '@/theme/breakpoints'
import { HEADER_BAR_H, MOBILE_BOTTOM_NAV_MAX_W, Tabs } from '@ui'

import { TASK_DETAIL_TAB_BODY_MIN_H } from '../../helpers/taskDetailLayout'
import type { TaskDetailTab } from '../../helpers/taskDetailTabs'

export type TaskDetailTabSlot = {
  key: TaskDetailTab
  label: string
  badge?: number
  cards: ReactNode
}

export type TaskDetailTabLayoutProps = {
  /** The task title. It scrolls with the page and collapses into the page header's bar. */
  title: ReactNode
  tabs: TaskDetailTabSlot[]
  value: TaskDetailTab
  onChange: (key: TaskDetailTab) => void
  ariaLabel: string
  fitted?: boolean
  fittedBelowLg?: boolean
  px?: BoxProps['px']
  /** Desktop right rail (Help & actions, Analytics, Activity). Hidden below `lg`. */
  rail?: ReactNode
  /** Row under the title (chips). Scrolls away with the page. */
  meta?: ReactNode
  /** Desktop main CTA beside the title, bottom-aligned with `meta`; scrolls away. Hidden below `lg`. */
  mainCta?: ReactNode
  /** The desktop CTA is a lone button: size it to its content, not half the row. */
  mainCtaFit?: boolean
}

const COMPACT_MAX_PX = WEB_MIN_PX - 1

/**
 * Web main CTA: half the row (wider than the 1/3 rail cards), capped at the
 * floating nav width.
 */
const WEB_MAIN_CTA_W = `min(${MOBILE_BOTTOM_NAV_MAX_W}, calc((100% - 1.5rem) / 2))`

/** Title and chips stop short of a card CTA that rises beside them. */
const BESIDE_CTA_MAX_W = `calc(100% - ${WEB_MAIN_CTA_W} - 1.5rem)`

/**
 * Compact (phone + tablet) wash sits under the title and fades up into the
 * map, not on the Mapbox canvas. It travels with the title as the page
 * scrolls.
 */
const COMPACT_TITLE_FADE_CSS = {
  isolation: 'isolate',
  overflow: 'visible',
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  [`@media screen and (max-width: ${COMPACT_MAX_PX}px)`]: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      width: '100vw',
      transform: 'translateX(-50%)',
      bottom: 0,
      height: COMPACT_DETAIL_HERO_H.base,
      backgroundImage: MAP_FADE_BOTTOM,
      pointerEvents: 'none',
      zIndex: -2,
    },
  },
  [`@media screen and (min-width: 768px) and (max-width: ${COMPACT_MAX_PX}px)`]:
    {
      '&::before': {
        height: COMPACT_DETAIL_HERO_H.md,
      },
    },
} as const

/**
 * Compact: the chips continue the title's wash (full bleed), so there's no
 * seam between them. Isolated only here, so the web card CTA can still rise
 * above the clear title chrome.
 */
const COMPACT_META_BAND_CSS = {
  [`@media screen and (max-width: ${COMPACT_MAX_PX}px)`]: {
    isolation: 'isolate',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      width: '100vw',
      transform: 'translateX(-50%)',
      top: 0,
      bottom: 0,
      background: MAP_FADE_EDGE,
      pointerEvents: 'none',
      zIndex: -1,
    },
  },
} as const

/**
 * Task-detail tab layout: the title scrolls with the page and collapses into
 * the page header's bar (FE-458), so only the tab headers stick, under the
 * bar. The chips and the web main CTA sit under and beside the title (CTA
 * bottom-aligned with the chips) and scroll away, then the cards and the
 * desktop rail share a top edge in the 2:1 grid. The compact pin lives in
 * TaskDetailMainCta.
 */
export function TaskDetailTabLayout({
  title,
  tabs,
  value,
  onChange,
  ariaLabel,
  fitted = false,
  fittedBelowLg = false,
  px,
  rail,
  meta,
  mainCta,
  mainCtaFit = false,
}: TaskDetailTabLayoutProps) {
  // A card CTA rises beside the title (out of flow); a lone button sits in the chip row.
  const cardCta = mainCta != null && !mainCtaFit
  const besideCtaMaxW = {
    base: 'none',
    lg: cardCta ? BESIDE_CTA_MAX_W : 'none',
  } as const
  const splitColumns = rail
    ? { base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }
    : '1fr'

  return (
    <>
      {/* Phones and tablets: the wash fades the map under the title. */}
      <Box
        position="relative"
        px={px}
        pt={2}
        pb={1}
        css={COMPACT_TITLE_FADE_CSS}
      >
        <Box maxW={besideCtaMaxW}>{title}</Box>
      </Box>
      <Tabs
        fitted={fitted}
        fittedBelowLg={fittedBelowLg}
        sticky
        stickyTop={`${HEADER_BAR_H}px`}
        stickyBg={tabs.length > 1 ? 'bg.canvas' : 'transparent'}
        stickyChromeProps={{ borderTopRadius: 0 }}
        panelBg={{ base: 'bg.canvas', lg: 'transparent' }}
        fadeTabListBorder
        hideTabList={tabs.length < 2}
        w="full"
        px={px}
        aria-label={ariaLabel}
        value={value}
        onChange={(key) => {
          const next = tabs.find((tab) => tab.key === key)
          if (next) onChange(next.key)
        }}
        tabs={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          badge: tab.badge,
        }))}
      >
        {meta || mainCta ? (
          <Box position="relative" pb={4} css={COMPACT_META_BAND_CSS}>
            <HStack align="flex-end" gap={6}>
              <Box flex="1" minW={0} maxW={besideCtaMaxW}>
                {meta}
              </Box>
              {mainCta && !cardCta ? (
                <Box display={{ base: 'none', lg: 'block' }} flexShrink={0}>
                  {mainCta}
                </Box>
              ) : null}
            </HStack>
            {cardCta ? (
              // Above the tab chrome that sticks over the title's row.
              <Box
                display={{ base: 'none', lg: 'block' }}
                position="absolute"
                right={0}
                bottom={4}
                w={WEB_MAIN_CTA_W}
                zIndex={6}
              >
                {mainCta}
              </Box>
            ) : null}
          </Box>
        ) : null}
        <Stack gap={5} w="full" pt={5} pb={6}>
          <Grid
            templateColumns={splitColumns}
            columnGap={6}
            alignItems="start"
            w="full"
          >
            <Box minW={0}>
              {tabs.map((tab) => (
                <Tabs.Panel key={tab.key} value={tab.key} pt={0} pb={0}>
                  <Stack
                    gap={5}
                    w="full"
                    minW={0}
                    minH={TASK_DETAIL_TAB_BODY_MIN_H}
                    pointerEvents="auto"
                  >
                    {tab.cards}
                  </Stack>
                </Tabs.Panel>
              ))}
            </Box>
            {rail ? (
              <Box
                display={{ base: 'none', lg: 'block' }}
                minW={0}
                pointerEvents="auto"
              >
                {rail}
              </Box>
            ) : null}
          </Grid>
        </Stack>
      </Tabs>
    </>
  )
}

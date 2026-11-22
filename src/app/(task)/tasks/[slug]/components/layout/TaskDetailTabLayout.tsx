'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import {
  COMPACT_TITLE_FADE_ABOVE,
  MAP_FADE_EDGE,
  MAP_FADE_TITLE,
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
  /** Desktop main CTA beside the title, its bottom level with the title's; scrolls away. Hidden below `lg`. */
  mainCta?: ReactNode
  /** The desktop CTA is a lone button: size it to its content, not half the row. */
  mainCtaFit?: boolean
}

const COMPACT_MAX_PX = WEB_MIN_PX - 1

/**
 * The room under the title's last line, before the line under it: 12 on
 * phones, 16 from md (Chakra steps 3 and 4).
 */
const TITLE_TO_LINE = { base: 3, md: 4 } as const

/**
 * The web CTA sits this far above the line (16), so its bottom is level with
 * the title's last line. The CTA only shows from `lg`.
 */
const CTA_ABOVE_LINE = 4

/**
 * Web main CTA: half the row (wider than the 1/3 rail cards), capped at the
 * floating nav width.
 */
const WEB_MAIN_CTA_W = `min(${MOBILE_BOTTOM_NAV_MAX_W}, calc((100% - 1.5rem) / 2))`

/** The title stops short of a card CTA that rises beside it. */
const BESIDE_CTA_MAX_W = `calc(100% - ${WEB_MAIN_CTA_W} - 1.5rem)`

/** And short of a lone button: room for the widest ("Find worker", "Send a quote") and the gap. */
const BESIDE_BUTTON_MAX_W = 'calc(100% - 13.5rem)'

/**
 * Compact (phone + tablet) wash sits under the title and fades up into the
 * map, not on the Mapbox canvas. It travels with the title as the page
 * scrolls. It covers only the title and a short fade above it (FE-524): the
 * map above is clear, so its streets, the area and the pin read.
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
      height: `calc(100% + ${COMPACT_TITLE_FADE_ABOVE})`,
      backgroundImage: MAP_FADE_TITLE,
      pointerEvents: 'none',
      zIndex: -2,
    },
  },
} as const

/**
 * Compact: the line under the title continues the title's wash (full bleed),
 * so there's no seam between them. Isolated only here, so the web card CTA
 * can still rise above the clear title chrome.
 */
const COMPACT_LINE_BAND_CSS = {
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
 * bar. A line under the title ends its block (Ryan 22 Nov: the row of
 * shortcut chips that sat there is gone, and the status pill follows the
 * title). The web main CTA sits beside the title, its bottom level with the
 * title's, and both scroll away. Then the cards and the desktop rail share a
 * top edge in the 2:1 grid. The compact pin lives in TaskDetailMainCta.
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
  mainCta,
  mainCtaFit = false,
}: TaskDetailTabLayoutProps) {
  // The CTA rises beside the title (out of flow): a card half the row wide,
  // or a lone button as wide as its words.
  const cardCta = mainCta != null && !mainCtaFit
  const besideCtaMaxW = {
    base: 'none',
    lg:
      mainCta == null
        ? 'none'
        : cardCta
          ? BESIDE_CTA_MAX_W
          : BESIDE_BUTTON_MAX_W,
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
        pb={TITLE_TO_LINE}
        css={COMPACT_TITLE_FADE_CSS}
      >
        <Box maxW={besideCtaMaxW}>{title}</Box>
      </Box>
      <Tabs
        fitted={fitted}
        fittedBelowLg={fittedBelowLg}
        sticky
        stickyTop={`${HEADER_BAR_H}px`}
        stickyBg={tabs.length > 1 ? 'bg.surface' : 'transparent'}
        stickyChromeProps={{ borderTopRadius: 0 }}
        panelBg={{ base: 'bg.surface', lg: 'transparent' }}
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
        {/* The line under the title: a hairline that ends the title's block. */}
        <Box
          data-task-title-line=""
          position="relative"
          borderBottomWidth="1px"
          borderColor="border.default"
          css={COMPACT_LINE_BAND_CSS}
        >
          {mainCta ? (
            // Out of flow, above the tab chrome that sticks over the title's row.
            <Box
              display={{ base: 'none', lg: 'block' }}
              position="absolute"
              right={0}
              bottom={CTA_ABOVE_LINE}
              w={cardCta ? WEB_MAIN_CTA_W : undefined}
              zIndex={6}
            >
              {mainCta}
            </Box>
          ) : null}
        </Box>
        <Stack gap={5} w="full" pt={5} pb={6}>
          <Grid
            data-task-detail-body=""
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

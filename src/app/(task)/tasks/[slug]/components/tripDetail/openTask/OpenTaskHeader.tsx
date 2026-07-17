'use client'

import { Box, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'
import { TaskStatusPill } from '../TaskStatusPill'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { useTaskDetailHeaderCollapsed } from '../../../helpers/taskDetailHeaderCollapse'
import { TaskHeaderControls } from '../TaskHeaderControls'
import { selectStatusHeaderCopy } from '../statusHeaderCopy'

const heroTextShadow = '0 1px 2px rgba(255, 255, 255, 0.75)'

/**
 * Scrollable height the desktop page reserves (as bottom padding) so
 * collapsing this header never removes scroll room mid-gesture — matches the
 * hero rows that collapse away (breathing room + pill + headline + subtext).
 */
export const OPEN_TASK_HEADER_SCROLL_RESERVE = '340px'

const collapseTransition = {
  transitionProperty:
    'grid-template-rows, opacity, background-color, transform, max-width, height',
  transitionDuration: sdlMotion.duration.slow,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

/** Vertical row that collapses to zero height (+ fades) when `collapsed`. */
function CollapsibleRow({
  collapsed,
  children,
}: {
  collapsed: boolean
  children: ReactNode
}) {
  return (
    <Box
      display="grid"
      gridTemplateRows={collapsed ? '0fr' : '1fr'}
      opacity={collapsed ? 0 : 1}
      pointerEvents="none"
      aria-hidden={collapsed}
      {...collapseTransition}
    >
      <Box overflow="hidden" minH={0}>
        {children}
      </Box>
    </Box>
  )
}

/**
 * Desktop open-task header. Sticky over the fixed map; at rest it's a spacious
 * hero (Back with label top-left, overflow top-right, then pill · headline ·
 * subtext). On scroll it animates into a compact `‹ · headline · ⋮` bar. The
 * page reserves matching bottom padding (see TaskDetailView) so collapsing
 * never removes scrollable height mid-gesture. The surface fades into the
 * content below rather than a hard border + shadow.
 */
export function OpenTaskHeader() {
  const { task, myQuote, isAuthenticated, permissions, statusReady } =
    useTaskDetail()
  const collapsed = useTaskDetailHeaderCollapsed()

  if (!task) return null

  const copy = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  return (
    <Box
      position={{ base: 'relative', lg: 'sticky' }}
      top={{ lg: 0 }}
      zIndex={20}
      w="full"
      bg={{ lg: collapsed ? 'bg.surface' : 'transparent' }}
      css={{ overflowAnchor: 'none' }}
      {...collapseTransition}
    >
      {/* Soft fade into the content below — replaces the hard border + shadow. */}
      <Box
        aria-hidden
        display={{ base: 'none', lg: 'block' }}
        position="absolute"
        left={0}
        right={0}
        top="100%"
        h="24px"
        pointerEvents="none"
        opacity={collapsed ? 1 : 0}
        transitionProperty="opacity"
        transitionDuration={sdlMotion.duration.slow}
        transitionTimingFunction={sdlMotion.easing.standard}
        css={{
          background:
            'linear-gradient(to bottom, var(--chakra-colors-bg-surface), transparent)',
        }}
      />

      <Box
        maxW="6xl"
        mx="auto"
        w="full"
        px={{ base: 4, md: 6 }}
        py={2}
        pointerEvents="none"
      >
        {/* Persistent row — Back · (headline when collapsed) · overflow. Never
            wrapped in an overflow:hidden collapse box, so its dropdown never
            clips. Chips sit over the map while expanded; the collapsed surface
            is solid, so they fade to plain ghost buttons. */}
        <TaskHeaderControls
          overlay={!collapsed}
          showBackLabel
          labelCollapsed={collapsed}
        >
          {/* Headline once collapsed — shares the Back/overflow row. */}
          <Text
            flex="1"
            minW={0}
            truncate
            fontWeight={600}
            fontSize="md"
            color="text.default"
            opacity={collapsed ? 1 : 0}
            pointerEvents="none"
            {...collapseTransition}
          >
            {statusReady ? copy.headline : ''}
          </Text>
        </TaskHeaderControls>

        {/* Generous breathing room so more of the map shows in the hero;
            collapses to nothing on scroll. */}
        <Box
          h={collapsed ? '0px' : { base: '56px', md: '104px' }}
          {...collapseTransition}
        />

        {statusReady ? (
          <Stack
            gap={collapsed ? 0 : 3}
            w="full"
            maxW={{ md: '2xl' }}
            animation={`rise-in 0.35s ${sdlMotion.easing.decelerate}`}
          >
            <CollapsibleRow collapsed={collapsed}>
              <TaskStatusPill status={copy.pill} size="lg" />
            </CollapsibleRow>

            {/* Expanded hero headline — collapses away as its compact twin on
                the row above fades in. */}
            <CollapsibleRow collapsed={collapsed}>
              <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{ base: '24px', md: '28px' }}
                fontWeight={600}
                lineHeight="1.2"
                color="text.default"
                textShadow={heroTextShadow}
              >
                {copy.headline}
              </Heading>
            </CollapsibleRow>

            <CollapsibleRow collapsed={collapsed}>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="text.muted"
                textShadow={heroTextShadow}
              >
                {copy.subtext}
              </Text>
            </CollapsibleRow>
          </Stack>
        ) : (
          // Viewer state unconfirmed — placeholder lines instead of guessing
          // the status copy (which previously flashed the wrong state).
          <Stack gap={3} w="full" maxW={{ md: '2xl' }} aria-busy>
            <Skeleton h="28px" w="92px" borderRadius="full" />
            <Skeleton h="30px" w="min(340px, 75%)" borderRadius="md" />
            <Skeleton h="18px" w="min(420px, 90%)" borderRadius="md" />
          </Stack>
        )}
      </Box>
    </Box>
  )
}

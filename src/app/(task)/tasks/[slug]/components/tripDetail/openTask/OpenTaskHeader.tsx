'use client'

import { Box, HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Button, Dropdown, IconButton, StatusPill } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  TASK_COLLAPSE_VAR,
  useTaskDetailHeaderCollapsed,
} from '../../../helpers/taskDetailHeaderCollapse'
import { TaskOverflowMenu } from '../TaskOverflowMenu'
import { selectStatusHeaderCopy } from '../statusHeaderCopy'

const heroTextShadow = '0 1px 2px rgba(255, 255, 255, 0.75)'

/** Collapse progress (0 expanded → 1 collapsed), scroll-driven. */
const P = `var(${TASK_COLLAPSE_VAR}, 0)`
/** Inverse progress. */
const INV = `(1 - ${P})`

/**
 * Hero row that interpolates away with scroll progress: height, opacity, and
 * its stack spacing all track `--task-collapse` continuously, so the header
 * can rest anywhere mid-transition. `maxPx` bounds the row's expanded height.
 */
function ProgressRow({
  collapsed,
  maxPx,
  withGap = false,
  children,
}: {
  collapsed: boolean
  maxPx: number
  /** Adds the stack gap above this row (also interpolated away). */
  withGap?: boolean
  children: ReactNode
}) {
  return (
    <Box
      overflow="hidden"
      pointerEvents="none"
      aria-hidden={collapsed}
      style={{
        maxHeight: `calc(${INV} * ${maxPx}px)`,
        opacity: `calc(${INV} * ${INV})`,
        marginTop: withGap ? `calc(${INV} * 12px)` : undefined,
      }}
    >
      {children}
    </Box>
  )
}

/**
 * Desktop open-task header. Sticky over the fixed map; at rest it's a spacious
 * hero (Back with label top-left, overflow top-right, then pill · headline ·
 * subtext). Scrolling interpolates it CONTINUOUSLY into a compact
 * `‹ · headline · ⋮` bar — driven by the `--task-collapse` scroll progress
 * variable, so stopping mid-scroll holds the in-between state (no snap). The
 * surface fades into the content below rather than a hard border + shadow.
 */
export function OpenTaskHeader() {
  const router = useRouter()
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

  // Expanded controls sit over the map — a translucent chip keeps them legible;
  // once the surface is solid the chip fades to transparent. Boolean-driven
  // (color tokens can't interpolate via the CSS var), softened by transition.
  const controlBg = collapsed ? 'transparent' : 'whiteAlpha.700'
  const controlHoverBg = collapsed ? 'bg.subtle' : 'whiteAlpha.900'
  const controlTransition = {
    transitionProperty: 'background-color',
    transitionDuration: sdlMotion.duration.base,
    transitionTimingFunction: sdlMotion.easing.standard,
  } as const

  return (
    <Box
      position={{ base: 'relative', lg: 'sticky' }}
      top={{ lg: 0 }}
      zIndex={20}
      w="full"
      css={{ overflowAnchor: 'none' }}
    >
      {/* Solid surface fades in with scroll progress (bg tokens can't lerp). */}
      <Box
        aria-hidden
        display={{ base: 'none', lg: 'block' }}
        position="absolute"
        inset={0}
        bg="bg.surface"
        pointerEvents="none"
        style={{ opacity: `calc(${P})` }}
      />

      {/* Soft fade into the content below — replaces a hard border + shadow. */}
      <Box
        aria-hidden
        display={{ base: 'none', lg: 'block' }}
        position="absolute"
        left={0}
        right={0}
        top="100%"
        h="24px"
        pointerEvents="none"
        style={{ opacity: `calc(${P})` }}
        css={{
          background:
            'linear-gradient(to bottom, var(--chakra-colors-bg-surface), transparent)',
        }}
      />

      <Box
        position="relative"
        maxW="6xl"
        mx="auto"
        w="full"
        px={{ base: 4, md: 6 }}
        py={2}
        pointerEvents="none"
      >
        {/* Persistent row — Back · (headline as it collapses) · overflow.
            Never inside an overflow:hidden box, so the dropdown never clips. */}
        <HStack gap={3} align="center" minH="44px" w="full">
          <Button
            type="button"
            variant="ghost"
            color="gray.900"
            fontWeight={600}
            h="auto"
            minH="44px"
            px={2}
            ml={-2}
            flexShrink={0}
            pointerEvents="auto"
            bg={controlBg}
            _hover={{ bg: controlHoverBg, color: 'gray.900' }}
            onClick={() => router.back()}
            aria-label="Go back"
            {...controlTransition}
          >
            <HStack gap={1.5} align="center">
              <LuArrowLeft />
              {/* Label narrows to icon-only with scroll progress. */}
              <Box
                as="span"
                overflow="hidden"
                whiteSpace="nowrap"
                style={{
                  maxWidth: `calc(${INV} * 80px)`,
                  opacity: `calc(${INV})`,
                }}
              >
                Back
              </Box>
            </HStack>
          </Button>

          {/* Compact headline — fades in on the Back/overflow row as the hero
              headline below fades out (continuous crossfade). */}
          <Text
            flex="1"
            minW={0}
            truncate
            fontWeight={600}
            fontSize="md"
            color="gray.900"
            pointerEvents="none"
            style={{ opacity: `calc(${P} * ${P})` }}
          >
            {statusReady ? copy.headline : ''}
          </Text>

          <Box pointerEvents="auto" flexShrink={0}>
            <Dropdown
              contentLabel="Task options"
              align="end"
              trigger={
                <IconButton
                  type="button"
                  variant="ghost"
                  aria-label="Task options"
                  color="gray.900"
                  bg={controlBg}
                  _hover={{ bg: controlHoverBg }}
                  {...controlTransition}
                >
                  <LuEllipsisVertical />
                </IconButton>
              }
            >
              <TaskOverflowMenu />
            </Dropdown>
          </Box>
        </HStack>

        {/* Breathing room for the map hero — shrinks with scroll progress. */}
        <Box
          h={{
            base: `calc(${INV} * 56px)`,
            md: `calc(${INV} * 104px)`,
          }}
        />

        {statusReady ? (
          <Stack
            gap={0}
            w="full"
            maxW={{ md: '2xl' }}
            animation={`rise-in 0.35s ${sdlMotion.easing.decelerate}`}
          >
            <ProgressRow collapsed={collapsed} maxPx={40}>
              <StatusPill status={copy.pill} size="lg" />
            </ProgressRow>

            <ProgressRow collapsed={collapsed} maxPx={76} withGap>
              <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{ base: '24px', md: '28px' }}
                fontWeight={600}
                lineHeight="1.2"
                color="gray.900"
                textShadow={heroTextShadow}
              >
                {copy.headline}
              </Heading>
            </ProgressRow>

            <ProgressRow collapsed={collapsed} maxPx={64} withGap>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.700"
                textShadow={heroTextShadow}
              >
                {copy.subtext}
              </Text>
            </ProgressRow>
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

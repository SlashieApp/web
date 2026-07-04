'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Button, Dropdown, IconButton, StatusPill } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { useTaskDetailHeaderCollapsed } from '../../../helpers/taskDetailHeaderCollapse'
import { TaskOverflowMenu } from '../TaskOverflowMenu'
import { selectStatusHeaderCopy } from '../statusHeaderCopy'

const heroTextShadow = '0 1px 2px rgba(255, 255, 255, 0.75)'

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
 * subtext). On scroll the pill/subtext and the map gap collapse away, the Back
 * label collapses to an icon, and the headline snaps up onto the Back/overflow
 * row — a compact `‹ · headline · ⋮` bar. The surface fades into the content
 * below rather than a hard border + shadow.
 */
export function OpenTaskHeader() {
  const router = useRouter()
  const { task, myQuote, isAuthenticated, permissions } = useTaskDetail()
  const collapsed = useTaskDetailHeaderCollapsed()

  if (!task) return null

  const copy = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  // Expanded controls sit over the map — a translucent chip keeps them legible;
  // once collapsed the surface is solid, so the chip fades to transparent.
  const controlBg = collapsed ? 'transparent' : 'whiteAlpha.700'
  const controlHoverBg = collapsed ? 'bg.subtle' : 'whiteAlpha.900'

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
            clips. */}
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
            {...collapseTransition}
          >
            <HStack gap={1.5} align="center">
              <LuArrowLeft />
              {/* Label collapses to an icon-only button on scroll. */}
              <Box
                as="span"
                overflow="hidden"
                whiteSpace="nowrap"
                maxW={collapsed ? '0px' : '80px'}
                opacity={collapsed ? 0 : 1}
                {...collapseTransition}
              >
                Back
              </Box>
            </HStack>
          </Button>

          {/* Headline once collapsed — shares the Back/overflow row. */}
          <Text
            flex="1"
            minW={0}
            truncate
            fontWeight={600}
            fontSize="md"
            color="gray.900"
            opacity={collapsed ? 1 : 0}
            pointerEvents="none"
            {...collapseTransition}
          >
            {copy.headline}
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
                  {...collapseTransition}
                >
                  <LuEllipsisVertical />
                </IconButton>
              }
            >
              <TaskOverflowMenu />
            </Dropdown>
          </Box>
        </HStack>

        {/* Generous breathing room so more of the map shows in the hero;
            collapses to nothing on scroll. */}
        <Box
          h={collapsed ? '0px' : { base: '56px', md: '104px' }}
          {...collapseTransition}
        />

        <Stack gap={collapsed ? 0 : 3} w="full" maxW={{ md: '2xl' }}>
          <CollapsibleRow collapsed={collapsed}>
            <StatusPill status={copy.pill} size="lg" />
          </CollapsibleRow>

          {/* Expanded hero headline — collapses away as its compact twin on the
              row above fades in. */}
          <CollapsibleRow collapsed={collapsed}>
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
          </CollapsibleRow>

          <CollapsibleRow collapsed={collapsed}>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.700"
              textShadow={heroTextShadow}
            >
              {copy.subtext}
            </Text>
          </CollapsibleRow>
        </Stack>
      </Box>
    </Box>
  )
}

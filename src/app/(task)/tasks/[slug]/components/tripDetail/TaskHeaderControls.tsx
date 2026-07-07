'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Button, Dropdown, IconButton } from '@ui'

import { TaskOverflowMenu } from './TaskOverflowMenu'

const controlTransition = {
  transitionProperty: 'background-color, opacity, max-width, visibility',
  transitionDuration: sdlMotion.duration.slow,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

type TaskHeaderControlsProps = {
  /**
   * Translucent legibility chips for controls floating over the map hero.
   * When false the controls render as plain ghost buttons on a solid surface
   * (the chip fades between the two, so flipping this mid-collapse animates).
   */
  overlay?: boolean
  /** Render the "Back" text next to the arrow (false = icon-only). */
  showBackLabel?: boolean
  /** Compact state: shrinks the Back label away to icon-only. */
  labelCollapsed?: boolean
  /**
   * Fade the pair out AND drop it from hit-testing and the tab order
   * (visibility) — used on the mobile hero once the compact sticky bar, which
   * carries its own controls, takes over.
   */
  hidden?: boolean
  /** Middle slot between Back and the overflow trigger (compact headline…). */
  children?: ReactNode
}

/**
 * Back · [middle] · task-overflow row shared by the task-detail headers
 * (desktop hero, mobile hero, mobile compact bar). The row itself is
 * pointer-transparent so the map behind stays draggable between the controls.
 */
export function TaskHeaderControls({
  overlay = false,
  showBackLabel = true,
  labelCollapsed = false,
  hidden = false,
  children,
}: TaskHeaderControlsProps) {
  const router = useRouter()
  const chipBg = overlay ? 'whiteAlpha.700' : 'transparent'
  const chipHoverBg = overlay ? 'whiteAlpha.900' : 'bg.subtle'

  return (
    <HStack
      gap={3}
      align="center"
      minH="44px"
      w="full"
      pointerEvents="none"
      opacity={hidden ? 0 : 1}
      visibility={hidden ? 'hidden' : 'visible'}
      {...controlTransition}
    >
      <Button
        type="button"
        variant="ghost"
        color="text.default"
        fontWeight={600}
        h="auto"
        minH="44px"
        px={2}
        ml={-2}
        flexShrink={0}
        pointerEvents="auto"
        bg={chipBg}
        _hover={{ bg: chipHoverBg, color: 'text.default' }}
        onClick={() => router.back()}
        aria-label="Go back"
        {...controlTransition}
      >
        <HStack gap={1.5} align="center">
          <LuArrowLeft />
          {showBackLabel ? (
            <Box
              as="span"
              overflow="hidden"
              whiteSpace="nowrap"
              maxW={labelCollapsed ? '0px' : '80px'}
              opacity={labelCollapsed ? 0 : 1}
              {...controlTransition}
            >
              Back
            </Box>
          ) : null}
        </HStack>
      </Button>

      {children ?? <Box flex={1} />}

      <Box pointerEvents="auto" flexShrink={0}>
        <Dropdown
          contentLabel="Task options"
          align="end"
          trigger={
            <IconButton
              type="button"
              variant="ghost"
              aria-label="Task options"
              color="text.default"
              bg={chipBg}
              _hover={{ bg: chipHoverBg }}
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
  )
}

'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { findScrollParent } from '@/utils/findScrollParent'

import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'

export type StickyHeaderProps = {
  title: string
  description?: ReactNode
  /** Shows the back control when set. */
  onBack?: () => void
  /** Text for the open-state back button. */
  backLabel?: string
  /** Accessible label for the compact icon back button. */
  backAriaLabel?: string
  /** Primary action pinned to the right. Receives `isStuck` to compact itself. */
  action?: ReactNode | ((ctx: { isStuck: boolean }) => ReactNode)
}

const MOTION = {
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

/**
 * Page header that sticks to the top of the scroll pane. Open: back link,
 * large title, description, action aligned to the block's end. Once stuck
 * it compacts: white full-bleed bar, icon back button inline with a smaller
 * title, action centred on the right. The scroll pane should clip x-overflow
 * (the app shell `main` does) so the full-bleed bar adds no scrollbar.
 */
export function StickyHeader({
  title,
  description,
  onBack,
  backLabel,
  backAriaLabel,
  action,
}: StickyHeaderProps) {
  const [isStuck, setIsStuck] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: findScrollParent(node), threshold: 0 },
    )
    observer.observe(node)
    observerRef.current = observer
  }, [])

  const actionNode = typeof action === 'function' ? action({ isStuck }) : action

  return (
    <>
      <Box ref={sentinelRef} h="1px" w="full" aria-hidden />
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        w="full"
        py={isStuck ? 3 : { base: 4, md: 6 }}
        transitionProperty="padding"
        {...MOTION}
        data-stuck={isStuck ? '' : undefined}
      >
        <Box
          aria-hidden
          position="absolute"
          top={0}
          bottom={0}
          left="50%"
          w="100vw"
          transform="translateX(-50%)"
          bg="bg.surface"
          borderBottomWidth="1px"
          borderColor="border.default"
          opacity={isStuck ? 1 : 0}
          pointerEvents="none"
          transitionProperty="opacity"
          {...MOTION}
        />
        <HStack
          position="relative"
          gap={4}
          w="full"
          minW={0}
          align={isStuck ? 'center' : 'flex-end'}
          justify="space-between"
        >
          <Stack gap={isStuck ? 0 : 2} flex="1 1 auto" minW={0}>
            {onBack && !isStuck ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                alignSelf="flex-start"
                ml={-3}
                color="text.muted"
                onClick={onBack}
              >
                <LuArrowLeft />
                {backLabel}
              </Button>
            ) : null}
            <HStack gap={2} minW={0} align="center">
              {onBack && isStuck ? (
                <IconButton
                  type="button"
                  variant="ghost"
                  aria-label={backAriaLabel ?? backLabel ?? 'Back'}
                  flexShrink={0}
                  ml={-2}
                  onClick={onBack}
                >
                  <LuArrowLeft />
                </IconButton>
              ) : null}
              <Heading
                as="h1"
                minW={0}
                fontFamily="heading"
                fontSize={
                  isStuck
                    ? { base: 'md', md: 'lg' }
                    : { base: '2xl', md: '3xl' }
                }
                fontWeight={isStuck ? 600 : 700}
                lineHeight={isStuck ? '1.3' : '1.15'}
                color="text.default"
                truncate={isStuck}
                transitionProperty="font-size, font-weight, line-height"
                {...MOTION}
              >
                {title}
              </Heading>
            </HStack>
            {isStuck || !description ? null : (
              <Text fontSize="sm" color="text.muted" maxW="3xl">
                {description}
              </Text>
            )}
          </Stack>
          {actionNode ? <Box flexShrink={0}>{actionNode}</Box> : null}
        </HStack>
      </Box>
    </>
  )
}

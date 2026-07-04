'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { sdlMotion } from '@/theme/styles'

import { TaskDetailAppBar } from './TaskDetailAppBar'

/**
 * Desktop-only: a compact task header (back · title · overflow) that pins to the
 * top and slides in once the map hero has scrolled out of view. The map itself
 * is not sticky — only this text header persists on scroll.
 *
 * Implemented with a zero-height sticky layer (so it never reserves flow space)
 * plus a sentinel observed to toggle the "stuck" appearance.
 */
export function TaskDetailStickyHeaderBar() {
  const [stuck, setStuck] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top <= 0)
      },
      { threshold: 0 },
    )
    observer.observe(node)
    observerRef.current = observer
  }, [])

  return (
    <>
      {/* Sentinel sits at the hero's bottom edge; once it scrolls above the top
          the compact bar becomes "stuck". */}
      <Box ref={sentinelRef} aria-hidden h="1px" w="full" />

      <Box
        position="sticky"
        top={0}
        zIndex={20}
        h={0}
        display={{ base: 'none', lg: 'block' }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bg="bg.surface"
          borderBottomWidth="1px"
          borderColor="border.default"
          boxShadow={stuck ? 'card' : 'none'}
          px={{ base: 4, md: 6 }}
          py={1}
          opacity={stuck ? 1 : 0}
          transform={stuck ? 'translateY(0)' : 'translateY(-100%)'}
          pointerEvents={stuck ? 'auto' : 'none'}
          transitionProperty="opacity, transform, box-shadow"
          transitionDuration={sdlMotion.duration.base}
          transitionTimingFunction={sdlMotion.easing.standard}
        >
          <Box maxW="6xl" mx="auto" w="full">
            <TaskDetailAppBar />
          </Box>
        </Box>
      </Box>
    </>
  )
}

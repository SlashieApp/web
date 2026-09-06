'use client'

import { Box, Container } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { PAGE_CONTAINER_MAX_W } from '@/theme/pageContainer'
import { sdlMotion } from '@/theme/styles'

import { WorkersSearchBar } from './WorkersSearchBar'

/**
 * Search bar sits over the map, then pins to the top of the scrolling
 * `<main>` and expands to the full pane width (no side gutters).
 */
export function WorkersStickySearch() {
  const [stuck, setStuck] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (!node) return

    const root = node.closest('main')
    const update = () => {
      const rootTop = root?.getBoundingClientRect().top ?? 0
      setStuck(node.getBoundingClientRect().bottom <= rootTop + 1)
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(update, {
            root: root ?? undefined,
            threshold: 0,
          })
    observer?.observe(node)
    root?.addEventListener('scroll', update, { passive: true })
    update()

    cleanupRef.current = () => {
      observer?.disconnect()
      root?.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <>
      <Box ref={sentinelRef} aria-hidden h="1px" w="full" />
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        data-stuck={stuck ? 'true' : 'false'}
        bg={stuck ? 'bg.canvas' : 'transparent'}
        boxShadow={stuck ? 'e2' : 'none'}
        transitionProperty="background-color, box-shadow"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <Container
          maxW={stuck ? '100%' : PAGE_CONTAINER_MAX_W}
          px={stuck ? 0 : { base: 4, md: 12 }}
          w="full"
          transitionProperty="padding, max-width"
          transitionDuration={sdlMotion.duration.moderate}
          transitionTimingFunction={sdlMotion.easing.standard}
        >
          <Box
            w={stuck ? 'full' : { base: 'full', md: '90%' }}
            mx="auto"
            transitionProperty="width"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
          >
            <WorkersSearchBar stuck={stuck} />
          </Box>
        </Container>
      </Box>
    </>
  )
}

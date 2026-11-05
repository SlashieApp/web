'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { sdlMotion } from '@/theme/styles'
import { PageBleed } from '@ui'

import { WorkersSearchBar } from './WorkersSearchBar'

/**
 * Search bar sits over the map, then pins to the top of the scrolling
 * `<main>`. Its background and shadow run edge to edge when it is stuck, but
 * the search itself stays in the page container, on the logo line (R5).
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
      <PageBleed
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
        <WorkersSearchBar stuck={stuck} />
      </PageBleed>
    </>
  )
}

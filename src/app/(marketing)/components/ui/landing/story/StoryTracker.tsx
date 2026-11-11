'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { useEffect } from 'react'

import { type StoryStage, isStoryStage, setStoryStage } from './storyState'

/** Marks a block of the page as one story stage (see `StoryTracker`). */
export function StoryStageMarker({
  stage,
  ...props
}: BoxProps & { stage: StoryStage }) {
  return <Box data-story-stage={stage} {...props} />
}

/**
 * Publishes the active stage: whichever marked block crosses the middle of
 * the viewport.
 */
export function StoryTracker() {
  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>('[data-story-stage]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const stage = (entry.target as HTMLElement).dataset.storyStage
          if (entry.isIntersecting && isStoryStage(stage)) setStoryStage(stage)
        }
      },
      // A one-pixel band across the middle of the viewport.
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const block of blocks) observer.observe(block)
    return () => observer.disconnect()
  }, [])

  return null
}

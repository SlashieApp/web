'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { useEffect } from 'react'

import { watchSceneBlocks } from './sceneWatch'
import {
  type StoryStage,
  isStoryStage,
  setHeroInView,
  setSceneVisible,
  setStoryPointer,
  setStoryStage,
} from './storyState'

/** Marks a block of the page as one story stage (see `StoryTracker`). */
export function StoryStageMarker({
  stage,
  ...props
}: BoxProps & { stage: StoryStage }) {
  return <Box data-story-stage={stage} {...props} />
}

/**
 * Publishes the active stage: whichever marked block crosses the middle of
 * the viewport. Also says whether the 3D scene can be seen at all (a
 * transparent block is on screen: `sceneWatch`), so it stops drawing behind
 * the opaque panels, and whether the hero is (the hero's formation of props is
 * for the hero only: `sceneStage`), and feeds the pointer position to the scene (fine
 * pointers only; touch has no hover to follow).
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
    const stopWatchingScene = watchSceneBlocks((visible, heroInView) => {
      setSceneVisible(visible)
      setHeroInView(heroInView)
    })

    const finePointer = window.matchMedia('(pointer: fine)').matches
    const onPointer = (event: PointerEvent) => {
      setStoryPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      )
    }
    if (finePointer) window.addEventListener('pointermove', onPointer)

    return () => {
      observer.disconnect()
      stopWatchingScene()
      setSceneVisible(true)
      setHeroInView(true)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return null
}

'use client'

import { useSyncExternalStore } from 'react'

/**
 * Scroll stages of the landing story, top to bottom. The 3D scene moves its
 * objects to each stage's formation and the phone shows each stage's screen.
 */
export const STORY_STAGES = [
  'hero',
  'post',
  'quotes',
  'chat',
  'hire',
  'review',
  'workerFind',
  'workerQuote',
  'workerProfile',
  'trust',
  'pricing',
  'cta',
] as const

export type StoryStage = (typeof STORY_STAGES)[number]

export function isStoryStage(value: string | undefined): value is StoryStage {
  return (STORY_STAGES as readonly string[]).includes(value ?? '')
}

/**
 * One landing page per document, so a module singleton is enough. The scene
 * reads it every frame without re-rendering; React reads `stage` through
 * `useStoryStage`.
 */
const state = {
  stage: 'hero' as StoryStage,
  /** Pointer position, -1..1 from the viewport centre (fine pointers only). */
  pointerX: 0,
  pointerY: 0,
  /** The live 3D scene has drawn, so the hero's still poster can go. */
  sceneReady: false,
}

const listeners = new Set<() => void>()

export const storyState: Readonly<typeof state> = state

export function setStoryStage(stage: StoryStage): void {
  if (state.stage === stage) return
  state.stage = stage
  for (const listener of listeners) listener()
}

export function setSceneReady(ready: boolean): void {
  if (state.sceneReady === ready) return
  state.sceneReady = ready
  for (const listener of listeners) listener()
}

export function setStoryPointer(x: number, y: number): void {
  state.pointerX = x
  state.pointerY = y
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStoryStage(): StoryStage {
  return useSyncExternalStore(
    subscribe,
    () => state.stage,
    () => 'hero',
  )
}

export function useSceneReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.sceneReady,
    () => false,
  )
}

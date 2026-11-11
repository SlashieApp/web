'use client'

import { useSyncExternalStore } from 'react'

/**
 * Scroll stages of the landing story, top to bottom. The phone shows each
 * stage's screen and the index row marks it.
 */
export const STORY_STAGES = [
  'hero',
  'post',
  'quotes',
  'hire',
  'chat',
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
 * One landing page per document, so a module singleton is enough. React reads
 * `stage` through `useStoryStage`.
 */
const state = {
  stage: 'hero' as StoryStage,
  /**
   * An act of the sideways story (`StoryRail`) is on screen: its phone is
   * docked where the floating Post a task pill sits, so the pill steps aside.
   */
  railOnScreen: false,
}

/** The sideways acts on screen now (two acts, each says for itself). */
const railsOnScreen = new Set<string>()

const listeners = new Set<() => void>()

export function setStoryStage(stage: StoryStage): void {
  if (state.stage === stage) return
  state.stage = stage
  for (const listener of listeners) listener()
}

/** A sideways act (`id`) says whether it is on screen. */
export function setRailOnScreen(id: string, onScreen: boolean): void {
  if (onScreen) railsOnScreen.add(id)
  else railsOnScreen.delete(id)
  const any = railsOnScreen.size > 0
  if (state.railOnScreen === any) return
  state.railOnScreen = any
  for (const listener of listeners) listener()
}

/** Calls `listener` whenever the stage or the sideways acts change. Returns the unsubscribe. */
function subscribeStory(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStoryStage(): StoryStage {
  return useSyncExternalStore(
    subscribeStory,
    () => state.stage,
    () => 'hero',
  )
}

/** Whether an act of the sideways story is on screen (the pill steps aside). */
export function useRailOnScreen(): boolean {
  return useSyncExternalStore(
    subscribeStory,
    () => state.railOnScreen,
    () => false,
  )
}

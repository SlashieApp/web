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
  /**
   * A transparent block of the page (the hero, how it works, the close) is on
   * screen, so a prop can be seen. Every other section is an opaque panel that
   * hides the scene, so the scene stops drawing while none is in view. True
   * until the tracker has looked, so the first frames draw.
   */
  sceneVisible: true,
  /**
   * The hero is on screen. The hero's formation of props is only for the hero:
   * once it has scrolled away, behind the opaque panels, the props wait off the
   * edges (`sceneStage`). True until the tracker has looked.
   */
  heroInView: true,
  /**
   * An act of the sideways story (`StoryRail`) is on screen: its phone is
   * docked where the floating Post a task pill sits, so the pill steps aside.
   */
  railOnScreen: false,
}

/** The sideways acts on screen now (two acts, each says for itself). */
const railsOnScreen = new Set<string>()

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

export function setSceneVisible(visible: boolean): void {
  if (state.sceneVisible === visible) return
  state.sceneVisible = visible
  for (const listener of listeners) listener()
}

export function setHeroInView(inView: boolean): void {
  if (state.heroInView === inView) return
  state.heroInView = inView
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

export function setStoryPointer(x: number, y: number): void {
  state.pointerX = x
  state.pointerY = y
}

/**
 * Calls `listener` whenever the stage, the scene's readiness, its visibility or
 * the hero's visibility change. Returns the unsubscribe. The 3D scene uses it to
 * ask for a frame when it can be seen again.
 */
export function subscribeStory(listener: () => void) {
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

export function useSceneReady(): boolean {
  return useSyncExternalStore(
    subscribeStory,
    () => state.sceneReady,
    () => false,
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

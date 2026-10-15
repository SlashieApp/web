import { Text } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import { setStoryStage } from '../story/storyState'
import { LandingBackdrop } from './LandingBackdrop'

/** Story-only: sets what `(prefers-reduced-motion: reduce)` reports until cleanup. */
function emulateReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = original.call(window, query)
    if (!/prefers-reduced-motion:\s*reduce/.test(query)) return list
    return new Proxy(list, {
      get(target, prop) {
        if (prop === 'matches') return matches
        const value = Reflect.get(target, prop)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  }
  return () => {
    window.matchMedia = original
  }
}

/**
 * Story-only: reports a device class (and no reduced motion, whatever the OS
 * says) to the tier detection until cleanup, so the live scene always mounts.
 */
function emulateDevice({ cores, memory }: { cores: number; memory: number }) {
  const restoreMotion = emulateReducedMotion(false)
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: cores,
    configurable: true,
  })
  Object.defineProperty(navigator, 'deviceMemory', {
    value: memory,
    configurable: true,
  })
  return () => {
    Reflect.deleteProperty(navigator, 'hardwareConcurrency')
    Reflect.deleteProperty(navigator, 'deviceMemory')
    restoreMotion()
  }
}

/** Story-only: a caption above the fixed backdrop says which case this is. */
function caption(text: string): Decorator {
  return (Story) => (
    <>
      <Story />
      <Text
        position="relative"
        zIndex={1}
        p={4}
        fontSize="sm"
        color="text.muted"
      >
        {text}
      </Text>
    </>
  )
}

const meta = {
  title: 'Marketing/Landing/LandingBackdrop',
  component: LandingBackdrop,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LandingBackdrop>

export default meta
type Story = StoryObj<typeof meta>

/** Story-only: the lazy scene has mounted its canvas. */
async function expectLiveScene(canvasElement: HTMLElement) {
  await waitFor(
    () => expect(canvasElement.querySelector('canvas')).not.toBeNull(),
    { timeout: 15000 },
  )
}

/** Desktop-class device on a wide screen: mint wash and the full six-object scene. */
export const Desktop: Story = {
  decorators: [caption('Desktop device, wide screen: the full scene')],
  beforeEach: () => {
    setStoryStage('hero')
    return emulateDevice({ cores: 8, memory: 8 })
  },
  play: ({ canvasElement }) => expectLiveScene(canvasElement),
}

/** Phone width: the scene switches to its three small compact objects. */
export const Phone: Story = {
  decorators: [caption('Phone width: three compact objects')],
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  beforeEach: () => {
    setStoryStage('hero')
    return emulateDevice({ cores: 4, memory: 4 })
  },
  play: ({ canvasElement }) => expectLiveScene(canvasElement),
}

/** Low-end device on a wide screen: compact objects and a lower pixel ratio. */
export const LowEndDevice: Story = {
  decorators: [caption('Low-end device, wide screen: compact objects')],
  beforeEach: () => {
    setStoryStage('hero')
    return emulateDevice({ cores: 2, memory: 2 })
  },
  play: ({ canvasElement }) => expectLiveScene(canvasElement),
}

/** Reduced motion: no canvas, only the mint wash (the hero shows a still poster). */
export const ReducedMotion: Story = {
  decorators: [caption('Reduced motion: the wash only, no 3D scene')],
  beforeEach: () => emulateReducedMotion(true),
}

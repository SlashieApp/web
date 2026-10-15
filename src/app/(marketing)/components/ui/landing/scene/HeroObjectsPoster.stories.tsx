import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { setSceneReady } from '../story/storyState'
import { HeroObjectsPoster } from './HeroObjectsPoster'

/**
 * Story-only: the poster as the hero places it. It sits in a positioned hero
 * block just under a header bar and reaches up behind the header, over the
 * mint wash, to cover one full screen height.
 */
const withHeroBlock: Decorator = (Story) => (
  <Box
    position="relative"
    isolation="isolate"
    overflow="hidden"
    h="100vh"
    bgGradient="to-b"
    gradientFrom="status.success.soft"
    gradientTo="bg.canvas"
  >
    <Box
      h={HEADER_MIN_HEIGHT}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
    />
    <Box position="relative">
      <Story />
    </Box>
  </Box>
)

const meta = {
  title: 'Marketing/Landing/HeroObjectsPoster',
  component: HeroObjectsPoster,
  parameters: { layout: 'fullscreen' },
  decorators: [withHeroBlock],
} satisfies Meta<typeof HeroObjectsPoster>

export default meta
type Story = StoryObj<typeof meta>

/** Wide screen, live scene not drawn yet: the wide still of the six hero objects. */
export const Wide: Story = {}

/** Phone width: the browser picks the compact still (three objects). */
export const Compact: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Live scene drawn: the poster fades out and the real 3D scene takes over. */
export const SceneReady: Story = {
  beforeEach: () => {
    setSceneReady(true)
    return () => setSceneReady(false)
  },
  play: async ({ canvasElement }) => {
    const poster = canvasElement.querySelector('picture')?.parentElement
    if (!poster) throw new Error('Poster layer not found')
    await waitFor(() => expect(getComputedStyle(poster).opacity).toBe('0'), {
      timeout: 3000,
    })
  },
}

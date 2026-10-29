import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { setSceneReady } from '../story/storyState'
import {
  HeroObjectsPoster,
  POSTER_LARGE_MIN_PX,
  POSTER_PHONE_SRC,
  POSTER_SOURCES,
} from './HeroObjectsPoster'

/** The still the browser chose, by file name. */
function chosenStill(canvasElement: HTMLElement): string {
  const img = canvasElement.querySelector('picture img')
  if (!(img instanceof HTMLImageElement)) throw new Error('No poster image')
  return img.currentSrc.split('/').pop() ?? ''
}

/** The file name of a still's path. */
const fileOf = (path: string) => path.split('/').pop() ?? ''

/**
 * Story-only: the poster as the hero places it. It sits in a positioned hero
 * block just under a header bar and reaches up behind the header, over the
 * page's white, to cover one full screen height.
 */
const withHeroBlock: Decorator = (Story) => (
  <Box
    position="relative"
    isolation="isolate"
    overflow="hidden"
    h="100vh"
    bg="bg.surface"
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

/** Wide screen, live scene not drawn yet: the wide still of the three hero objects. */
export const Wide: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(chosenStill(canvasElement)).toBe(fileOf(POSTER_SOURCES[1].src)),
    )
  },
}

/** Phone width: the browser picks the compact still (two objects). */
export const Compact: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(chosenStill(canvasElement)).toBe(fileOf(POSTER_PHONE_SRC)),
    )
  },
}

/** Tablet width (below `lg`): its own still, rendered at 768 x 1024, so the objects are where the live scene puts them there. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(chosenStill(canvasElement)).toBe(fileOf(POSTER_SOURCES[2].src)),
    )
  },
}

/**
 * The picture holds only its `source`s and the `img`: a styled `img` would put
 * a `<style>` tag between them, and the browser then fetches the wide still as
 * well as the one that applies on a phone. The large still is for screens from
 * 1700px wide.
 */
export const OnlySourcesAndAnImage: Story = {
  play: async ({ canvasElement }) => {
    const picture = canvasElement.querySelector('picture')
    if (!picture) throw new Error('No picture')
    const tags = [...picture.children].map((node) => node.tagName)
    await expect(tags).toEqual(['SOURCE', 'SOURCE', 'SOURCE', 'IMG'])
    await expect(picture.querySelector('style')).toBeNull()
    await expect(
      [...picture.querySelectorAll('source')].map((node) =>
        node.getAttribute('media'),
      ),
    ).toEqual([
      `(min-width: ${POSTER_LARGE_MIN_PX}px)`,
      '(min-width: 1024px)',
      '(min-width: 768px)',
    ])
  },
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

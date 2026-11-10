import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { expect, waitFor } from 'storybook/test'

import {
  STORY_STAGES,
  type StoryStage,
  setHeroInView,
  setStoryStage,
} from '../story/storyState'
import LandingScene from './LandingScene'

function SceneFrame({
  stage,
  compact,
  transparent = false,
  heroInView = true,
}: {
  stage: StoryStage
  compact: boolean
  /** No ground at all: used to render the still poster with a clear background. */
  transparent?: boolean
  /** Whether the hero is on screen: once it is not, the hero's props wait off the edges. */
  heroInView?: boolean
}) {
  useEffect(() => {
    setStoryStage(stage)
    setHeroInView(heroInView)
    return () => setHeroInView(true)
  }, [stage, heroInView])
  return (
    <Box
      position="fixed"
      inset={0}
      // The page's own ground: white, as the backdrop paints it.
      bg={transparent ? undefined : 'bg.surface'}
    >
      <LandingScene compact={compact} dprMax={2} />
    </Box>
  )
}

/**
 * Story-only: the box a phone's hero keeps for the toolbox (`HeroToolboxSlot`),
 * 72px square and a gutter in from the left, where the English hero has it on
 * a 390 x 844 phone. The scene reads it off the page.
 */
const withToolboxSlot: Decorator = (Story) => (
  <>
    <Story />
    <Box
      data-hero-toolbox-slot=""
      position="fixed"
      left="16px"
      top="440px"
      boxSize="72px"
    />
  </>
)

const meta = {
  title: 'Marketing/Landing/LandingScene',
  component: SceneFrame,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      options: {
        laptop768: {
          name: 'Laptop 1366 x 768',
          styles: { width: '1366px', height: '768px' },
          type: 'desktop',
        },
      },
    },
  },
  args: { stage: 'hero', compact: false },
  argTypes: {
    stage: { control: 'select', options: STORY_STAGES },
  },
  // Every formation draws a canvas (WebGL context, the models and the lights).
  play: ({ canvasElement }) =>
    waitFor(
      () => expect(canvasElement.querySelector('canvas')).not.toBeNull(),
      { timeout: 15000 },
    ),
} satisfies Meta<typeof SceneFrame>

export default meta
type Story = StoryObj<typeof meta>

/** Hero formation: the three objects at the sides of the hero text. */
export const Hero: Story = {}

/** Customer act formation (the Quotes step): objects down the right edge, beside the phone, the boxes brought forward. */
export const CustomerAct: Story = { args: { stage: 'quotes' } }

/** Worker act formation (the Send a quote step): the objects change places and the boxes come forward. */
export const WorkerAct: Story = { args: { stage: 'workerQuote' } }

/** Scatter formation (trust and pricing, under opaque panels): objects wait at the right edge. */
export const Scatter: Story = { args: { stage: 'trust' } }

/** Gather formation (the final call to action): objects either side of the call, outside its column. */
export const Gather: Story = { args: { stage: 'cta' } }

/** A tablet (below `lg`, from `sm`): two objects hugging the edges of the hero. */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'tablet', isRotated: false } },
}

/**
 * A phone (below `sm`): one prop, the toolbox, fitted whole (shadow included)
 * into the box the hero keeps for it, a gutter in from the screen's edge. No
 * pin and no boxes.
 */
export const Phone: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [withToolboxSlot],
}

/**
 * Phone, customer act: the text runs edge to edge, so no whole prop fits beside
 * it and a sliver at the edge read as a rendering fault: the props wait off the
 * edges (a tablet's right strip does hold the pin).
 */
export const CompactCustomerAct: Story = {
  args: { stage: 'quotes', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, worker act: the props wait off the edges here too. */
export const CompactWorkerAct: Story = {
  args: { stage: 'workerQuote', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, scatter (trust and pricing): objects only peek in at the far edges, under opaque panels. */
export const CompactScatter: Story = {
  args: { stage: 'trust', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, gather (final call to action): the centred text runs gutter to gutter, so the props wait off the edges. */
export const CompactGather: Story = {
  args: { stage: 'cta', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/**
 * The hero is out of view (the map panel and the bento are in front of it): the
 * hero's props wait off the edges instead of sitting in the middle of the
 * screen with their shadows showing under the opaque panels.
 */
export const HeroOutOfView: Story = {
  args: { stage: 'hero', heroInView: false },
}

/** A 1366 x 768 laptop, customer act: each prop whole in the strip beside the phone, scaled to fit. */
export const CustomerActLaptop: Story = {
  args: { stage: 'quotes' },
  globals: { viewport: { value: 'laptop768', isRotated: false } },
}

/** Source for the hero's still poster (`public/images/landing/`), wide (1440 x 900), transparent. */
export const PosterWide: Story = { args: { transparent: true } }

/** Source for the hero's still poster on a large screen (1920 x 1080), transparent. */
export const PosterLarge: Story = { args: { transparent: true } }

/** Source for the hero's still poster on a tablet (768 x 1024): the two compact objects, transparent. */
export const PosterMiddle: Story = {
  args: { transparent: true, compact: true },
  parameters: { viewport: { defaultViewport: 'tablet' } },
}

/**
 * Source for the hero's compact still (tall windows from `sm`): the two
 * compact objects, transparent. Below `sm` the scene draws the toolbox alone,
 * so render it 480px wide or more.
 */
export const PosterCompact: Story = {
  args: { transparent: true, compact: true },
}

/**
 * Source for a phone's toolbox still (`hero-toolbox.webp`): the toolbox in its
 * slot, transparent. Screenshot the slot's box (16, 440, 72 x 72) on a 390 x
 * 844 screen, at 3x.
 */
export const PosterToolbox: Story = {
  args: { transparent: true, compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [withToolboxSlot],
}

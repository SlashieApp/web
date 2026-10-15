import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'

import {
  STORY_STAGES,
  type StoryStage,
  setStoryStage,
} from '../story/storyState'
import LandingScene from './LandingScene'

function SceneFrame({
  stage,
  compact,
  transparent = false,
}: {
  stage: StoryStage
  compact: boolean
  /** No mint wash: used to render the still poster with a clear background. */
  transparent?: boolean
}) {
  useEffect(() => {
    setStoryStage(stage)
  }, [stage])
  return (
    <Box
      position="fixed"
      inset={0}
      bgGradient={transparent ? undefined : 'to-b'}
      gradientFrom="status.success.soft"
      gradientTo="bg.canvas"
    >
      <LandingScene compact={compact} dprMax={2} />
    </Box>
  )
}

const meta = {
  title: 'Marketing/Landing/LandingScene',
  component: SceneFrame,
  parameters: { layout: 'fullscreen' },
  args: { stage: 'hero', compact: false },
  argTypes: {
    stage: { control: 'select', options: STORY_STAGES },
  },
} satisfies Meta<typeof SceneFrame>

export default meta
type Story = StoryObj<typeof meta>

/** Hero formation: the six objects around where the hero phone sits. */
export const Hero: Story = {}

/** Customer act formation (the Quotes step): objects on the right half, boxes pulled in. */
export const CustomerAct: Story = { args: { stage: 'quotes' } }

/** Worker act formation (the Send a quote step): tools forward, screwdriver pulled in. */
export const WorkerAct: Story = { args: { stage: 'workerQuote' } }

/** Scatter formation (trust and pricing): objects busy on the right, peeking in left. */
export const Scatter: Story = { args: { stage: 'trust' } }

/** Gather formation (the final call to action): objects around the CTA band. */
export const Gather: Story = { args: { stage: 'cta' } }

/** Phones: three objects hugging the edges. */
export const Compact: Story = {
  args: { compact: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Phone, customer act: three small objects peek in from the edges beside the steps. */
export const CompactCustomerAct: Story = {
  args: { stage: 'quotes', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, worker act: the three objects swap sides with the customer act. */
export const CompactWorkerAct: Story = {
  args: { stage: 'workerQuote', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, scatter (trust and pricing): objects only peek in at the far edges. */
export const CompactScatter: Story = {
  args: { stage: 'trust', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, gather (final call to action): the three objects frame the band. */
export const CompactGather: Story = {
  args: { stage: 'cta', compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Source for the hero's still poster (`public/images/landing/`), wide, transparent. */
export const PosterWide: Story = { args: { transparent: true } }

/** Source for the hero's still poster, phone size: compact objects, transparent. */
export const PosterCompact: Story = {
  args: { transparent: true, compact: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

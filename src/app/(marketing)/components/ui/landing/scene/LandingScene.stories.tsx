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

/** The six objects around where the hero phone sits. */
export const Hero: Story = {}

export const CustomerAct: Story = { args: { stage: 'quotes' } }

export const WorkerAct: Story = { args: { stage: 'workerQuote' } }

export const Gather: Story = { args: { stage: 'cta' } }

/** Phones: three objects hugging the edges. */
export const Compact: Story = {
  args: { compact: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Source for the hero's still poster (`public/images/landing/`). */
export const PosterWide: Story = { args: { transparent: true } }

export const PosterCompact: Story = {
  args: { transparent: true, compact: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

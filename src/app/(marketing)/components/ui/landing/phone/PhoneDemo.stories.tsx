import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { STORY_STAGES, type StoryStage } from '../story/storyState'
import { PhoneScreen } from './PhoneDemo'
import { PhoneFrame } from './PhoneFrame'

const copy = messages.en.landing.phone

function DemoPhone({ stage, width }: { stage: StoryStage; width: number }) {
  return (
    <Box p={8} bg="status.success.soft" display="inline-block">
      <PhoneFrame label={copy.demoLabel} nominalWidth={width} w={`${width}px`}>
        <PhoneScreen stage={stage} copy={copy} active intro={false} />
      </PhoneFrame>
    </Box>
  )
}

const meta = {
  title: 'Marketing/Landing/PhoneDemo',
  component: DemoPhone,
  args: { stage: 'hero', width: 300 },
  argTypes: {
    stage: { control: 'select', options: STORY_STAGES.slice(0, 9) },
  },
} satisfies Meta<typeof DemoPhone>

export default meta
type Story = StoryObj<typeof meta>

/** Map search with price pins; the second pin is the tap beat. */
export const Search: Story = {}
export const PostTask: Story = { args: { stage: 'post' } }
export const Quotes: Story = { args: { stage: 'quotes' } }
export const Chat: Story = { args: { stage: 'chat' } }
export const Hire: Story = { args: { stage: 'hire' } }
export const Review: Story = { args: { stage: 'review' } }
export const WorkerSearch: Story = { args: { stage: 'workerFind' } }
export const WorkerQuote: Story = { args: { stage: 'workerQuote' } }
export const Profile: Story = { args: { stage: 'workerProfile' } }

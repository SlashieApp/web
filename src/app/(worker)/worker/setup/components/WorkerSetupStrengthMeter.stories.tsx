import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { computeProfileStrength } from '../helpers/workerProfileStrength'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from '../helpers/workerSetupFormState'
import {
  WorkerSetupStrengthMeter,
  type WorkerSetupStrengthMeterProps,
} from './WorkerSetupStrengthMeter'

function form(patch: Partial<WorkerSetupFormState>): WorkerSetupFormState {
  return { ...emptyWorkerSetupFormState(), ...patch }
}

const completeForm = form({
  tagline: 'Handyman with 8 years experience',
  bio: 'I fit and repair kitchens across North London. Customers choose me for tidy work and honest quotes with no surprises on the day.',
  primaryCategory: 'handyman',
  skills: ['TV Mounting', 'Shelving', 'Flat-pack'],
  locationName: 'Camden',
  portfolioUrls: ['https://example.com/job.jpg'],
})

const meta = {
  title: 'worker/setup/WorkerSetupStrengthMeter',
  component: WorkerSetupStrengthMeter,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <WorkerSetupStrengthMeter {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupStrengthMeterProps>

export default meta

type Story = StoryObj<typeof meta>

export const Starter: Story = {
  args: {
    strength: computeProfileStrength({
      form: form({}),
      avatarUrl: null,
      phoneVerified: false,
    }),
    onGoToStep: () => {},
  },
}

export const Good: Story = {
  args: {
    strength: computeProfileStrength({
      form: { ...completeForm, portfolioUrls: [], bio: 'short' },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: false,
    }),
    onGoToStep: () => {},
  },
}

export const AllStar: Story = {
  args: {
    strength: computeProfileStrength({
      form: completeForm,
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    }),
    onGoToStep: () => {},
  },
}

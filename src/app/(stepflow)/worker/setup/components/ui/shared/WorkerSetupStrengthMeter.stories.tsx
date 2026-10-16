import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { computeProfileStrength } from '../../../helpers/workerProfileStrength'
import {
  type WorkerSetupFormState,
  emptyWorkerSetupFormState,
} from '../../../helpers/workerSetupFormState'
import { ZH_HK_SETUP, withZhHk } from '../../workerSetupStoryFixtures'
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
  title: 'Worker setup/WorkerSetupStrengthMeter',
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

/** Starter tier: nothing done yet, so all seven signals are fix links. */
export const Starter: Story = {
  args: {
    strength: computeProfileStrength({
      form: form({}),
      avatarUrl: null,
      phoneVerified: false,
    }),
    onGoToScreen: () => {},
  },
}

/** Good tier: four of seven done; each fix link opens its screen. */
export const Good: Story = {
  args: {
    strength: computeProfileStrength({
      form: { ...completeForm, portfolioUrls: [], bio: 'short' },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: false,
    }),
    onGoToScreen: fn(),
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Write a bio of at least 80 characters',
      }),
    )
    await expect(args.onGoToScreen).toHaveBeenCalledWith('profile')
  },
}

/** All-star tier with one gap: six of seven done, one fix link left. */
export const AllStarOneMissing: Story = {
  args: {
    strength: computeProfileStrength({
      form: { ...completeForm, portfolioUrls: [] },
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    }),
    onGoToScreen: () => {},
  },
}

/** All-star tier: every signal done, so there are no fix links. */
export const AllStar: Story = {
  args: {
    strength: computeProfileStrength({
      form: completeForm,
      avatarUrl: 'https://example.com/avatar.jpg',
      phoneVerified: true,
    }),
    onGoToScreen: () => {},
  },
}

/** zh-HK. */
export const ZhHk: Story = {
  parameters: ZH_HK_SETUP,
  decorators: [withZhHk],
  args: { ...Good.args, onGoToScreen: () => {} },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('個人檔案完整度'),
    ).toBeVisible()
  },
}

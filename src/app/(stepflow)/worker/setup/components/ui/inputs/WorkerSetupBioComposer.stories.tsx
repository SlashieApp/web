import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { ZH_HK_SETUP, withZhHk } from '../../workerSetupStoryFixtures'
import {
  WorkerSetupBioComposer,
  type WorkerSetupBioComposerProps,
} from './WorkerSetupBioComposer'

function ControlledComposer(
  props: Omit<WorkerSetupBioComposerProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return <WorkerSetupBioComposer {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Worker setup/WorkerSetupBioComposer',
  component: WorkerSetupBioComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledComposer {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupBioComposerProps>

export default meta

type Story = StoryObj<typeof meta>

/** Empty: prompt starters and a meter at zero. */
export const Empty: Story = {
  args: { value: '', onChange: () => {} },
}

/** Under 80 characters: the meter reads "Too short yet". */
export const TooShort: Story = {
  args: { value: 'I do handyman jobs around London.', onChange: () => {} },
}

/** 80 to 159 characters: the meter reads "Good". */
export const Good: Story = {
  args: {
    value:
      'I fit and repair kitchens and bathrooms across North London. Tidy work, honest quotes and always on time.',
    onChange: () => {},
  },
}

/** 160 characters or more: the meter is full and reads "Great". */
export const Great: Story = {
  args: {
    value:
      'I fit and repair kitchens and bathrooms across North London, with 8 years on the tools. Customers choose me for tidy work, honest quotes and turning up when I say I will. Fully insured and City & Guilds qualified.',
    onChange: () => {},
  },
}

/** At the 300 character limit: the counter is full and typing stops. */
export const AtMaximum: Story = {
  args: {
    value:
      'I fit and repair kitchens and bathrooms across North London, with 8 years on the tools. Customers choose me for tidy work, honest quotes and turning up when I say I will. I also take small plumbing and tiling jobs, and I always leave the room cleaner than I found it. Fully insured and City & Guilds.',
    onChange: () => {},
  },
}

/** Placeholder text like "o" is rejected on Continue with the real message. */
export const RejectedJunk: Story = {
  args: {
    value: 'o',
    onChange: () => {},
    errorText:
      'Write at least 80 characters. Customers read this before they accept your quote.',
  },
}

/** "See an example" opened: a sample bio shows under the meter. */
export const ExampleOpen: Story = {
  args: { value: '', onChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: /see an example/i }),
    )
    await expect(canvas.getByText(/City & Guilds qualified/)).toBeVisible()
  },
}

/** zh-HK: starters, meter and example in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: ZH_HK_SETUP,
  decorators: [withZhHk],
  args: { value: '', onChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: '加入「我最擅長的工作是」' }),
    )
    await expect(canvas.getByRole('textbox')).toHaveValue('我最擅長的工作是')
  },
}

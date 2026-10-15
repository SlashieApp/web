import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { storyImage } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  WorkerSetupPortfolioInput,
  type WorkerSetupPortfolioInputProps,
} from './WorkerSetupPortfolioInput'

function ControlledPortfolio(
  props: Omit<WorkerSetupPortfolioInputProps, 'onChange'>,
) {
  const [value, setValue] = useState(props.value)
  return (
    <WorkerSetupPortfolioInput {...props} value={value} onChange={setValue} />
  )
}

const meta = {
  title: 'Worker setup/WorkerSetupPortfolioInput',
  component: WorkerSetupPortfolioInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="560px">
      <ControlledPortfolio {...args} />
    </Box>
  ),
} satisfies Meta<WorkerSetupPortfolioInputProps>

export default meta

type Story = StoryObj<typeof meta>

const photo = (color: string) => storyImage(color, 120)

/** Empty: just the link field and Add button. */
export const Empty: Story = {
  args: { value: [], onChange: () => {} },
}

/** An image link with a thumbnail, and a link that is not an image. */
export const WithItems: Story = {
  args: {
    value: [
      photo('#9ec5e8'),
      'https://kitchens.example.invalid/before-and-after',
    ],
    onChange: () => {},
  },
}

/** Twelve links added: the field and Add button are disabled. */
export const AtCap: Story = {
  args: {
    value: Array.from({ length: 12 }, (_, i) =>
      photo(`hsl(${i * 30}, 60%, 75%)`),
    ),
    onChange: () => {},
  },
}

/** Something that is not a web link is rejected with a message. */
export const InvalidLink: Story = {
  args: { value: [], onChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText(/finished-kitchen/),
      'not a link',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }))
    await expect(canvas.getByText(/Enter a full link/)).toBeVisible()
  },
}

/** Adding a link that is already listed is rejected with a message. */
export const DuplicateLink: Story = {
  args: {
    value: ['https://kitchens.example.invalid/job.jpg'],
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText(/finished-kitchen/),
      'https://kitchens.example.invalid/job.jpg',
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Add' }))
    await expect(canvas.getByText(/already in your portfolio/)).toBeVisible()
  },
}

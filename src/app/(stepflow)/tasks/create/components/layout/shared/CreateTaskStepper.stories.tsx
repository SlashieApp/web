import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import type { CreateTaskStepId } from '../../../views'
import { CreateTaskStepper } from './CreateTaskStepper'

const done = (...steps: CreateTaskStepId[]) => new Set(steps)

const meta = {
  title: 'Create task/CreateTaskStepper',
  component: CreateTaskStepper,
  parameters: { layout: 'padded' },
  args: { active: 'location', done: done(), onSelect: fn() },
} satisfies Meta<typeof CreateTaskStepper>

export default meta
type Story = StoryObj<typeof meta>

/** First step: every later step is locked. */
export const Location: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: /Details/ }),
    ).toBeDisabled()
  },
}

/** Details: the location is done, so it is a button back to the map. */
export const Details: Story = {
  args: { active: 'details', done: done('location') },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Location/ }),
    )
    await expect(args.onSelect).toHaveBeenCalledWith('location')
  },
}

/** Review: every step before it is done and reachable. */
export const Review: Story = {
  args: {
    active: 'review',
    done: done('location', 'details', 'timing', 'budget'),
  },
}

/** Back on the map after finishing later steps: they keep their ticks. */
export const RevisitingTheMap: Story = {
  args: {
    active: 'location',
    done: done('location', 'details', 'timing'),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: /Budget/ }),
    ).toBeEnabled()
  },
}

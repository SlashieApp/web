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
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: /Address/ })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: /Details/ })).toBeDisabled()
  },
}

/** Address: the pin is set, so the map is a button back; Details waits. */
export const Address: Story = {
  args: { active: 'address', done: done('location') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: /Location/ })).toBeEnabled()
    await expect(canvas.getByRole('button', { name: /Details/ })).toBeDisabled()
  },
}

/** Details: the location and address are done, so they are buttons back. */
export const Details: Story = {
  args: { active: 'details', done: done('location', 'address') },
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
    done: done('location', 'address', 'details', 'timing', 'budget'),
  },
}

/** Back on the map after finishing later steps: they keep their ticks. */
export const RevisitingTheMap: Story = {
  args: {
    active: 'location',
    done: done('location', 'address', 'details', 'timing'),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: /Budget/ }),
    ).toBeEnabled()
  },
}

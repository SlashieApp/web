import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskStepper } from './CreateTaskStepper'

const meta = {
  title: 'Create task/CreateTaskStepper',
  component: CreateTaskStepper,
  parameters: {
    layout: 'padded',
  },
  args: {
    activeSubStep: 'details.location',
    completedSubSteps: new Set<string>(),
    onSelectSubStep: () => {},
  },
} satisfies Meta<typeof CreateTaskStepper>

export default meta
type Story = StoryObj<typeof meta>

/** First step: nothing complete, every later required step is locked. */
export const Location: Story = {}

/** Basics: the location is done, so it can be revisited. */
export const Basics: Story = {
  args: {
    activeSubStep: 'details.basics',
    completedSubSteps: new Set(['details.location']),
  },
}

/** Timing: location and basics are done. */
export const Timing: Story = {
  args: {
    activeSubStep: 'details.timing',
    completedSubSteps: new Set(['details.location', 'details.basics']),
  },
}

/** Photos is optional, so the budget step after it is already reachable. */
export const Photos: Story = {
  args: {
    activeSubStep: 'publish.photos',
    completedSubSteps: new Set([
      'details.location',
      'details.basics',
      'details.timing',
    ]),
  },
}

/** Last step: everything before it is complete. */
export const ContactAndPublish: Story = {
  args: {
    activeSubStep: 'publish.contact',
    completedSubSteps: new Set([
      'details.location',
      'details.basics',
      'details.timing',
      'publish.photos',
      'publish.budget',
    ]),
  },
}

import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Stepper, type StepperStep } from './Stepper'

const workerSetupSteps: StepperStep[] = [
  {
    id: 'profile',
    label: 'Build your profile',
    subSteps: [
      { id: 'profile.details', label: 'Personal details' },
      { id: 'profile.photo', label: 'Profile photo' },
      { id: 'profile.bio', label: 'Public bio' },
    ],
  },
  {
    id: 'services',
    label: 'Your services',
    subSteps: [
      { id: 'services.skills', label: 'Skills' },
      { id: 'services.experience', label: 'Experience' },
    ],
  },
  {
    id: 'area',
    label: 'Service area',
    subSteps: [
      { id: 'area.location', label: 'Location' },
      { id: 'area.travel', label: 'Travel radius' },
    ],
  },
  {
    id: 'review',
    label: 'Review & go live',
    subSteps: [{ id: 'review.submit', label: 'Review' }],
  },
]

const meta = {
  title: 'ui/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    steps: workerSetupSteps,
    activeSubStepId: 'profile.details',
  },
  argTypes: {
    steps: { control: false },
    onSelectSubStep: { action: 'selectSubStep' },
  },
  decorators: [
    (Story) => (
      <Box maxW="320px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Stepper>

export default meta

type Story = StoryObj<typeof meta>

/** Sidebar step list on worker setup — click to jump between sub-steps. */
export const WorkerSetup: Story = {
  args: {
    steps: workerSetupSteps,
    activeSubStepId: 'services.skills',
    completedSubStepIds: ['profile.details', 'profile.photo', 'profile.bio'],
  },
  render: function WorkerSetupStepper(args) {
    const [active, setActive] = useState(args.activeSubStepId)
    return (
      <Stepper
        {...args}
        activeSubStepId={active}
        isSubStepUnlocked={() => true}
        onSelectSubStep={setActive}
      />
    )
  },
}

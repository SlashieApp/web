import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Stepper, type StepperStep } from './Stepper'

const steps: StepperStep[] = [
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
      { id: 'area.travel', label: 'Travel' },
    ],
  },
  {
    id: 'review',
    label: 'Review & go',
    subSteps: [{ id: 'review.submit', label: 'Review' }],
  },
]

const meta = {
  title: 'ui/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <Box maxW="320px">
        <Story />
      </Box>
    ),
  ],
  args: {
    steps,
    activeSubStepId: 'services.skills',
    completedSubStepIds: ['profile.details', 'profile.photo', 'profile.bio'],
  },
} satisfies Meta<typeof Stepper>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Interactive: Story = {
  render: function InteractiveStepper(args) {
    const [active, setActive] = useState('profile.photo')
    return (
      <Stepper
        {...args}
        activeSubStepId={active}
        completedSubStepIds={['profile.details']}
        isSubStepUnlocked={() => true}
        onSelectSubStep={setActive}
      />
    )
  },
}

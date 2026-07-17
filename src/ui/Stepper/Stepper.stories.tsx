import { Box, Stack, Text } from '@chakra-ui/react'
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

const flatSteps: StepperStep[] = [
  { id: 'account', label: 'Create account' },
  { id: 'verify', label: 'Verify email' },
  { id: 'done', label: 'All set' },
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
    activeSubStepId: { control: 'text' },
    completedSubStepIds: { control: false },
    isSubStepUnlocked: { control: false },
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

/** Default: first sub-step active, nothing completed. */
export const Default: Story = {}

/** Interactive sidebar — click or keyboard-focus a sub-step to jump. */
export const WorkerSetup: Story = {
  args: {
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

/** A run of completed sub-steps render a check tick + green dot. */
export const Completed: Story = {
  args: {
    activeSubStepId: 'review.submit',
    completedSubStepIds: [
      'profile.details',
      'profile.photo',
      'profile.bio',
      'services.skills',
      'services.experience',
      'area.location',
      'area.travel',
    ],
  },
}

/** Locked future sub-steps are dimmed and non-navigable (disabled). */
export const DisabledSubSteps: Story = {
  args: {
    activeSubStepId: 'services.skills',
    completedSubStepIds: ['profile.details', 'profile.photo', 'profile.bio'],
    isSubStepUnlocked: (id) =>
      [
        'profile.details',
        'profile.photo',
        'profile.bio',
        'services.skills',
      ].includes(id),
  },
}

/** Flat steps (no sub-steps) — no chevron, no expanded rail. */
export const FlatSteps: Story = {
  args: {
    steps: flatSteps,
    activeSubStepId: 'verify',
    completedSubStepIds: ['account'],
  },
}

/** Overview of every meaningful state side by side. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction={{ base: 'column', md: 'row' }} gap={8} align="flex-start">
      <Stack gap={2} maxW="280px">
        <Text fontSize="xs" fontWeight={700} color="text.muted">
          Start
        </Text>
        <Stepper steps={workerSetupSteps} activeSubStepId="profile.details" />
      </Stack>
      <Stack gap={2} maxW="280px">
        <Text fontSize="xs" fontWeight={700} color="text.muted">
          In progress
        </Text>
        <Stepper
          steps={workerSetupSteps}
          activeSubStepId="services.experience"
          completedSubStepIds={[
            'profile.details',
            'profile.photo',
            'profile.bio',
            'services.skills',
          ]}
        />
      </Stack>
      <Stack gap={2} maxW="280px">
        <Text fontSize="xs" fontWeight={700} color="text.muted">
          Flat (no sub-steps)
        </Text>
        <Stepper
          steps={flatSteps}
          activeSubStepId="verify"
          completedSubStepIds={['account']}
        />
      </Stack>
    </Stack>
  ),
}

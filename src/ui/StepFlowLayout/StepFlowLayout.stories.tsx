import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuCheck } from 'react-icons/lu'

import { FormField } from '../FormField'
import { Input } from '../Input/Input'
import { Textarea } from '../Textarea/Textarea'
import { StepFlowLayout, StepFlowProgress } from './StepFlowLayout'

/**
 * SDL StepFlowLayout — the shared shell for multi-step flows: send a quote,
 * worker profile setup, and task creation. Desktop (lg+) renders a stepper
 * rail + raised step panel (+ optional context aside); mobile renders the
 * progress strip, a scrollable step body, and a sticky action bar. Step
 * state/validation stay in each flow — the layout owns structure only.
 */
const meta = {
  title: 'layout/StepFlowLayout',
  component: StepFlowLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    banner: { control: false, table: { disable: true } },
    header: { control: false, table: { disable: true } },
    stepper: { control: false, table: { disable: true } },
    aside: { control: false, table: { disable: true } },
    mobileTop: { control: false, table: { disable: true } },
    progress: { control: false, table: { disable: true } },
    mobileBody: { control: false, table: { disable: true } },
    actions: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
    errorText: { control: 'text' },
  },
} satisfies Meta<typeof StepFlowLayout>

export default meta
type Story = StoryObj<typeof meta>

/** Demo stepper rail (real flows bind theirs to a steps config + context). */
function DemoStepper({ activeIndex }: { activeIndex: number }) {
  const steps = [
    'Profile details',
    'Skills & services',
    'Service area',
    'Portfolio',
    'Review & submit',
  ]
  return (
    <Stack gap={1}>
      {steps.map((label, index) => {
        const done = index < activeIndex
        const active = index === activeIndex
        return (
          <HStack
            key={label}
            gap={3}
            px={3}
            py={2.5}
            borderRadius="lg"
            bg={active ? 'status.success.soft' : 'transparent'}
          >
            <Box
              boxSize="24px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight={700}
              bg={done ? 'action.primary' : active ? 'bg.surface' : 'bg.subtle'}
              color={done ? 'text.onGreen' : 'text.muted'}
              borderWidth={done ? 0 : '1px'}
              borderColor={active ? 'status.success.solid' : 'border.default'}
              flexShrink={0}
            >
              {done ? <LuCheck size={13} strokeWidth={3} /> : index + 1}
            </Box>
            <Text
              fontSize="sm"
              fontWeight={600}
              color={active ? 'status.success.fg' : 'text.muted'}
            >
              {label}
            </Text>
          </HStack>
        )
      })}
    </Stack>
  )
}

/** Demo context aside (the quote flow shows the task being quoted). */
function DemoAside() {
  return (
    <Stack
      gap={3}
      p={5}
      bg="bg.surface"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="e1"
      h="fit-content"
    >
      <Text fontSize="xs" fontWeight={700} color="text.muted">
        YOU ARE QUOTING ON
      </Text>
      <Text fontWeight={700}>Mount bookshelf on living room wall</Text>
      <Text fontSize="sm" color="text.muted">
        Westminster, London · Budget £120
      </Text>
    </Stack>
  )
}

const demoFields = (
  <Stack gap={5} maxW="lg">
    <FormField label="Total price" helperText="The customer pays you directly.">
      <Input placeholder="£ 0" inputMode="decimal" />
    </FormField>
    <FormField label="Message" helperText="Introduce yourself and your plan.">
      <Textarea placeholder="I can do this Saturday morning with my own tools…" />
    </FormField>
  </Stack>
)

/** Three-column shape: stepper rail + step panel + context aside (quote flow). */
export const WithAside: Story = {
  args: {
    title: 'Your price',
    description:
      'Quote the total for the whole job — the customer compares quotes side by side.',
    stepper: <DemoStepper activeIndex={1} />,
    aside: <DemoAside />,
    progress: (
      <StepFlowProgress
        value={40}
        label="Step 2 of 5 · Your price"
        trackLabel="Quote progress"
      />
    ),
    actions: {
      showBack: true,
      continueLabel: 'Continue',
      onBack: () => {},
      onContinue: () => {},
    },
    children: demoFields,
  },
}

/** Two-column shape: stepper rail + step panel (worker setup). */
export const TwoColumn: Story = {
  args: {
    title: 'Profile details',
    description: 'Tell customers who you are and what you do.',
    stepper: <DemoStepper activeIndex={0} />,
    progress: (
      <StepFlowProgress
        value={10}
        label="Step 1 of 5 · Profile details"
        trackLabel="Worker setup progress"
      />
    ),
    actions: { continueLabel: 'Continue', onContinue: () => {} },
    children: demoFields,
  },
}

/** Save/submit error surfaced above the step content. */
export const WithError: Story = {
  args: {
    ...TwoColumn.args,
    errorText: 'Could not save your changes. Check your connection and retry.',
  },
}

/** Final step: continue becomes the submit action (no trailing arrow). */
export const FinalStep: Story = {
  args: {
    title: 'Review & submit',
    description: 'Check everything looks right before you start quoting.',
    stepper: <DemoStepper activeIndex={4} />,
    progress: (
      <StepFlowProgress
        value={95}
        label="Step 5 of 5 · Review & submit"
        trackLabel="Worker setup progress"
      />
    ),
    actions: {
      showBack: true,
      continueLabel: 'Start quoting',
      isFinal: true,
      continueLoading: false,
      onBack: () => {},
      onContinue: () => {},
    },
    children: (
      <Stack gap={3} maxW="lg">
        <Text fontSize="sm" color="text.muted">
          Name, skills, service area, and portfolio all set. Submitting takes
          you straight to nearby tasks.
        </Text>
      </Stack>
    ),
  },
}

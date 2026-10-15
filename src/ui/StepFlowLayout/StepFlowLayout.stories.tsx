import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuCheck, LuX } from 'react-icons/lu'
import { expect, waitFor, within } from 'storybook/test'

import { FormField } from '../FormField'
import { IconButton } from '../IconButton/IconButton'
import { Input } from '../Input/Input'
import { Logo } from '../Logo/Logo'
import { Textarea } from '../Textarea/Textarea'
import {
  StepFlowActions,
  StepFlowHeading,
  StepFlowLayout,
  StepFlowProgress,
} from './StepFlowLayout'

/**
 * SDL StepFlowLayout: the shared shell for multi-step flows (send a quote,
 * worker profile setup, and task creation). Desktop (lg+) renders a stepper
 * rail + raised step panel (+ optional context aside); mobile renders the
 * progress strip, a scrollable step body, and a sticky action bar. Step
 * state/validation stay in each flow, the layout owns structure only.
 */
const meta = {
  title: 'UI/StepFlowLayout',
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

/** Demo flow header: exit button, logo and flow name (real flows bring their own). */
const demoHeader = (
  <Box
    as="header"
    bg="bg.surface"
    borderBottomWidth="1px"
    borderColor="border.default"
    minH="56px"
    display="flex"
    alignItems="center"
    px={4}
  >
    <HStack gap={3} w="full" align="center">
      <IconButton
        aria-label="Close"
        variant="ghost"
        size="sm"
        minW="44px"
        minH="44px"
      >
        <LuX size={20} aria-hidden />
      </IconButton>
      <Logo containerProps={{ flexShrink: 0 }} />
      <Text
        fontSize="sm"
        fontWeight={600}
        color="text.default"
        flex={1}
        truncate
      >
        Send a quote
      </Text>
    </HStack>
  </Box>
)

/** Demo full-width strip above everything (the email verification banner). */
const demoBanner = (
  <Box
    bg="status.warning.soft"
    color="status.warning.fg"
    px={4}
    py={2.5}
    fontSize="sm"
    fontWeight={600}
    textAlign="center"
  >
    Verify your email to send quotes. We sent a link to sam@example.com.
  </Box>
)

/** Demo mobile-only context region (the task being quoted). */
const demoMobileTop = (
  <Box
    bg="bg.surface"
    px={4}
    py={3}
    borderBottomWidth="1px"
    borderColor="border.default"
  >
    <Text fontSize="xs" fontWeight={700} color="text.muted">
      YOU ARE QUOTING ON
    </Text>
    <Text fontSize="sm" fontWeight={700}>
      Mount bookshelf on living room wall
    </Text>
    <Text fontSize="xs" color="text.muted">
      Westminster, London · Budget £120
    </Text>
  </Box>
)

/** Demo custom mobile body: a step accordion with the first step open. */
const demoAccordionBody = (
  <Stack gap={0} bg="bg.surface">
    {['Profile details', 'Skills & services', 'Service area'].map(
      (label, index) => (
        <Box key={label} borderBottomWidth="1px" borderColor="border.default">
          <HStack gap={3} px={4} py={4}>
            <Box
              boxSize="24px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight={700}
              borderWidth="1px"
              borderColor={
                index === 0 ? 'status.success.solid' : 'border.default'
              }
              color={index === 0 ? 'status.success.fg' : 'text.muted'}
              flexShrink={0}
            >
              {index + 1}
            </Box>
            <Text
              flex={1}
              fontSize="sm"
              fontWeight={index === 0 ? 700 : 600}
              color={index === 0 ? 'text.default' : 'text.muted'}
            >
              {label}
            </Text>
          </HStack>
          {index === 0 ? (
            <Box px={4} pb={5}>
              {demoFields}
            </Box>
          ) : null}
        </Box>
      ),
    )}
  </Stack>
)

/** Enough fields that the step overflows and has to scroll. */
const longFields = (
  <Stack gap={5} maxW="lg">
    {[
      'Total price',
      'Call-out fee',
      'Materials',
      'Parts supplier',
      'Earliest start',
      'Access notes',
    ].map((label) => (
      <FormField key={label} label={label}>
        <Input placeholder="Add details" />
      </FormField>
    ))}
    <FormField label="Message" helperText="Introduce yourself and your plan.">
      <Textarea placeholder="I can do this Saturday morning with my own tools…" />
    </FormField>
  </Stack>
)

/** Three columns: stepper rail, step panel and context aside (quote flow). */
export const WithAside: Story = {
  args: {
    title: 'Your price',
    description:
      'Quote the total for the whole job. The customer compares quotes side by side.',
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

/** Flow header: an exit and logo bar above the stepper rail and panel. */
export const WithHeader: Story = {
  args: { ...TwoColumn.args },
  render: (args) => <StepFlowLayout {...args} header={demoHeader} />,
}

/** Banner: a full-width strip above the header (email verification). */
export const WithBanner: Story = {
  args: { ...TwoColumn.args },
  render: (args) => (
    <StepFlowLayout {...args} header={demoHeader} banner={demoBanner} />
  ),
}

/** Continue loading: the primary action spins while the step saves. */
export const ContinueLoading: Story = {
  args: {
    ...WithAside.args,
    actions: {
      showBack: true,
      continueLabel: 'Continue',
      continueLoading: true,
      onBack: () => {},
      onContinue: () => {},
    },
  },
}

/** Title only: no supporting description under the step heading. */
export const TitleOnly: Story = {
  args: { ...TwoColumn.args, description: undefined },
}

/** Custom labels: Back and Continue are renamed for the step. */
export const CustomActionLabels: Story = {
  args: {
    ...WithAside.args,
    actions: {
      showBack: true,
      backLabel: 'Previous step',
      continueLabel: 'Save and continue',
      onBack: () => {},
      onContinue: () => {},
    },
  },
}

/** Long content: the panel grows and the page scrolls to the action bar. */
export const LongContent: Story = {
  args: { ...WithAside.args, children: longFields },
}

/** Phone, middle step: progress, body and a sticky Back + Continue bar. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...WithAside.args, aside: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(
      () => expect(canvas.queryByText('Review & submit')).toBeNull(),
      {
        timeout: 3000,
      },
    )
    await expect(
      await canvas.findByRole('button', { name: 'Back' }, { timeout: 3000 }),
    ).toBeVisible()
  },
}

/** Phone, first step: no Back, so Continue fills the whole bar. */
export const MobileFirstStep: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...TwoColumn.args },
}

/** Phone with context: a task summary region above the progress strip. */
export const MobileWithContext: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...WithAside.args, aside: undefined },
  render: (args) => <StepFlowLayout {...args} mobileTop={demoMobileTop} />,
}

/** Phone, custom body: a step accordion replaces heading and content. */
export const MobileCustomBody: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...TwoColumn.args },
  render: (args) => <StepFlowLayout {...args} mobileBody={demoAccordionBody} />,
}

/** Phone, error: the save error shows above the step content. */
export const MobileWithError: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...WithError.args },
}

/** Phone, final step: the submit label drops the trailing arrow. */
export const MobileFinalStep: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...FinalStep.args },
}

/** Phone, continue loading: the primary action shows a spinner. */
export const MobileContinueLoading: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...ContinueLoading.args, aside: undefined },
}

/** Phone, long content: the body scrolls and the action bar stays pinned. */
export const MobileLongContent: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...LongContent.args, aside: undefined },
}

/** Props-only stories for the exported parts: no layout args apply. */
type PartStory = StoryObj

const partParameters = {
  layout: 'padded',
  controls: { disable: true },
} as const

/** Heading: the step title with its supporting copy. */
export const HeadingDefault: PartStory = {
  parameters: partParameters,
  render: () => (
    <Box maxW="lg">
      <StepFlowHeading
        title="Your price"
        description="Quote the total for the whole job. The customer compares quotes side by side."
      />
    </Box>
  ),
}

/** Heading, compact: a smaller title with tighter spacing. */
export const HeadingCompact: PartStory = {
  parameters: partParameters,
  render: () => (
    <Box maxW="lg">
      <StepFlowHeading
        compact
        title="Your price"
        description="Quote the total for the whole job."
      />
    </Box>
  ),
}

/** Heading, title only: no supporting copy. */
export const HeadingTitleOnly: PartStory = {
  parameters: partParameters,
  render: () => (
    <Box maxW="lg">
      <StepFlowHeading title="Your price" />
    </Box>
  ),
}

/** Actions, first step: no Back, so Continue sits alone on the right. */
export const ActionsFirstStep: PartStory = {
  parameters: partParameters,
  render: () => <StepFlowActions onContinue={() => {}} />,
}

/** Actions with Back: a link-style Back on the left, Continue on the right. */
export const ActionsWithBack: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions showBack onBack={() => {}} onContinue={() => {}} />
  ),
}

/** Actions, final step: the submit label drops the trailing arrow. */
export const ActionsFinal: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions
      showBack
      isFinal
      continueLabel="Start quoting"
      onBack={() => {}}
      onContinue={() => {}}
    />
  ),
}

/** Actions, loading: Continue shows a spinner while the step saves. */
export const ActionsLoading: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions
      showBack
      continueLoading
      onBack={() => {}}
      onContinue={() => {}}
    />
  ),
}

/** Actions, custom labels: Back and Continue read "Previous" and "Save". */
export const ActionsCustomLabels: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions
      showBack
      backLabel="Previous"
      continueLabel="Save and continue"
      onBack={() => {}}
      onContinue={() => {}}
    />
  ),
}

/** Actions, sticky: the bar pins to the bottom edge of a scrolling pane. */
export const ActionsSticky: PartStory = {
  parameters: partParameters,
  render: () => (
    <Box
      h="260px"
      overflowY="auto"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.surface"
    >
      <Stack p={4} gap={3}>
        <Text fontSize="sm" color="text.muted">
          Scroll this pane: the action bar stays at the bottom edge.
        </Text>
        <Box h="600px" />
      </Stack>
      <StepFlowActions
        sticky
        showBack
        onBack={() => {}}
        onContinue={() => {}}
      />
    </Box>
  ),
}

/** Progress: the mobile strip with a step caption under the header. */
export const Progress: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowProgress
      value={40}
      label="Step 2 of 5 · Your price"
      trackLabel="Quote progress"
    />
  ),
}

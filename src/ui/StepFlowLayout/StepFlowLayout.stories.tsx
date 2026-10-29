import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuCheck } from 'react-icons/lu'
import { expect, waitFor, within } from 'storybook/test'

import {
  desktop1280,
  expectNoBarLine,
  expectStepFlowFrame,
  expectWidth,
  phone390,
  stepFlowOf,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'

import { FormField } from '../FormField'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import { FormSection } from '../FormSection'
import { FormStack } from '../FormStack'
import { Input } from '../Input/Input'
import { Textarea } from '../Textarea/Textarea'
import {
  StepFlowActions,
  StepFlowHeader,
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
              fontWeight={500}
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
      <Text fontSize="xs" fontWeight={500} color="text.muted">
        YOU ARE QUOTING ON
      </Text>
      <Text fontWeight={500}>Mount bookshelf on living room wall</Text>
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

/** The flow header every step flow uses. */
const demoHeader = (
  <StepFlowHeader
    title="Send a quote"
    exitHref="/tasks/demo"
    closeLabel="Close"
  />
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
    <Text fontSize="xs" fontWeight={500} color="text.muted">
      YOU ARE QUOTING ON
    </Text>
    <Text fontSize="sm" fontWeight={500}>
      Mount bookshelf on living room wall
    </Text>
    <Text fontSize="xs" color="text.muted">
      Westminster, London · Budget £120
    </Text>
  </Box>
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

/** Flow header: Close (a link), the logo and the flow's name above the stepper rail and panel. */
export const WithHeader: Story = {
  args: { ...TwoColumn.args },
  render: (args) => <StepFlowLayout {...args} header={demoHeader} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Close' })).toHaveAttribute(
      'href',
      '/tasks/demo',
    )
    await expect(canvas.getByText('Send a quote')).toBeVisible()
  },
}

/** Phones: the header drops the logo so the flow's name fits beside Close. */
export const MobileWithHeader: Story = {
  args: { ...TwoColumn.args },
  globals: { viewport: { value: 'mobile1' } },
  render: (args) => <StepFlowLayout {...args} header={demoHeader} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Send a quote')).toBeVisible()
    await expect(canvasElement.querySelector('header img')).not.toBeVisible()
  },
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

/** Phone, posting with photos: the busy button says which photo is going up. */
export const MobilePostingPhotos: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    ...TwoColumn.args,
    actions: {
      showBack: true,
      isFinal: true,
      continueLabel: 'Post task',
      continueLoading: true,
      continueLoadingText: 'Preparing photo 1 of 3',
      onBack: () => {},
      onContinue: () => {},
    },
  },
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

/** Eight fields, so the step overflows its pane and scrolls on both layouts. */
const spacingFields = (
  <>
    {[
      'Total price',
      'Call-out fee',
      'Materials',
      'Parts supplier',
      'Earliest start',
      'Access notes',
      'Parking',
      'Anything else',
    ].map((label) => (
      <FormField key={label} label={label}>
        <Input placeholder="Add details" />
      </FormField>
    ))}
  </>
)

/**
 * Form spacing (FE-481): the description 8 under the title, the first field 24
 * under it, the fields 20 apart, the last one 20 above Continue at the end of the
 * scroll, Continue 48 tall, and no line over the bar. Desktop.
 */
export const Spacing: Story = {
  ...desktop1280,
  args: { ...WithAside.args, children: spacingFields },
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    await expectStepFlowFrame(canvasElement)
  },
}

/** The same frame on a phone (390 wide): the pane scrolls between the strip and the bar. */
export const SpacingPhone: Story = {
  ...phone390,
  args: { ...WithAside.args, aside: undefined, children: spacingFields },
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    await expectStepFlowFrame(canvasElement)
  },
}

/** A save error is the first field group: 24 under the description, 20 above the first field. */
export const SpacingError: Story = {
  ...desktop1280,
  args: {
    ...WithError.args,
    aside: undefined,
    children: spacingFields,
  },
  play: async ({ canvasElement }) => {
    const { body } = await expectStepFlowFrame(canvasElement)
    const error = within(canvasElement).getByRole('alert')
    await expect(body.firstElementChild).toBe(error)
  },
}

/** Sections: the flow passes one `FormStack gap="section"`, which sits 20 under the error and the notice above it. */
export const SpacingSections: Story = {
  ...phone390,
  args: {
    ...TwoColumn.args,
    children: (
      <>
        <Text fontSize="sm">A note above the sections.</Text>
        <FormStack gap="section">
          {['Details', 'Timing'].map((title) => (
            <FormSection key={title} title={title}>
              <FormField label={`${title} one`}>
                <Input />
              </FormField>
              <FormField label={`${title} two`}>
                <Input />
              </FormField>
            </FormSection>
          ))}
        </FormStack>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { body } = stepFlowOf(canvasElement)
    const [note, sections] = [...body.children] as HTMLElement[]
    await expect(gapBelow(note, sections)).toBe(formSpace.fieldGap)
    const [details, timing] = [...sections.children] as HTMLElement[]
    await expect(gapBelow(details, timing)).toBe(formSpace.sectionGap)
    // The title is 12 above its first field's label, and no rule is drawn.
    const title = canvas.getByRole('heading', { name: 'Details' })
    const label = canvas.getByText('Details one', { selector: 'label' })
    await expect(gapBelow(title, label)).toBe(formSpace.sectionTitleToField)
    await expect(getComputedStyle(timing).borderTopWidth).toBe('0px')
  },
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
  play: async ({ canvasElement }) => {
    // The description is 8 under the title; the heading owns the 24 under it.
    const { title, description, heading } = stepFlowOf(canvasElement)
    await expect(gapBelow(title, description as HTMLElement)).toBe(
      formSpace.titleToSubtitle,
    )
    await expect(getComputedStyle(heading).marginBottom).toBe(
      `${formSpace.headerToBody}px`,
    )
  },
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
  play: async ({ canvasElement }) => {
    // The map step's tighter header: 4 between the title and the description,
    // and no 24 under it (the card around it sets how far the first block is).
    const { title, description, heading } = stepFlowOf(canvasElement)
    await expect(gapBelow(title, description as HTMLElement)).toBe(4)
    await expect(getComputedStyle(heading).marginBottom).toBe('0px')
  },
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

/** Actions with Back: the arrow alone on the left (44px, named Back), Continue on the right. */
export const ActionsWithBack: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions showBack onBack={() => {}} onContinue={() => {}} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const back = canvas.getByRole('button', { name: 'Back' })
    await expect(back).toBeVisible()
    await expect(back).toHaveTextContent('')
    const { width, height } = back.getBoundingClientRect()
    await expect(width).toBeGreaterThanOrEqual(44)
    await expect(height).toBeGreaterThanOrEqual(44)
    // Continue is the form height (48), and the bar draws no line and has no
    // padding above the buttons: the body above it ends 20 from them.
    const main = canvas.getByRole('button', { name: /Continue/ })
    await expect(heightOf(main)).toBe(formSpace.controlHeight)
    await expectNoBarLine(main)
    const bar = main.parentElement?.parentElement as HTMLElement
    await expect(getComputedStyle(bar).paddingTop).toBe('0px')
  },
}

/** Phone, actions with Back: the arrow alone, so Continue takes the rest of the bar. */
export const MobileActionsWithBack: PartStory = {
  parameters: partParameters,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <StepFlowActions showBack onBack={() => {}} onContinue={() => {}} />
  ),
  play: async ({ canvasElement }) => {
    const back = within(canvasElement).getByRole('button', { name: 'Back' })
    await expect(back).toHaveTextContent('')
    await expect(back.getBoundingClientRect().width).toBeGreaterThanOrEqual(44)
  },
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

/** Actions, busy with a label: Post says which photo it's on, read out politely. */
export const ActionsLoadingWithLabel: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions
      showBack
      isFinal
      continueLabel="Post task"
      continueLoading
      continueLoadingText="Uploading photo 2 of 3"
      onBack={() => {}}
      onContinue={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Uploading photo 2 of 3' }),
    ).toBeDisabled()
    await expect(
      canvasElement.querySelector('[aria-live="polite"]'),
    ).toHaveTextContent('Uploading photo 2 of 3')
  },
}

/** Actions, idle: the polite status stays in the page, empty, until Continue is busy. */
export const ActionsStatusIdle: PartStory = {
  parameters: partParameters,
  render: () => (
    <StepFlowActions
      continueLoadingText="Uploading photo 1 of 3"
      onContinue={() => {}}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector('[aria-live="polite"]'),
    ).toBeEmptyDOMElement()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled()
  },
}

/** Actions, custom labels: Back is named "Previous" (still just the arrow); Continue reads "Save and continue". */
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Previous' })).toBeVisible()
    await expect(canvas.queryByText('Previous')).toBeNull()
    await expect(
      canvas.getByRole('button', { name: 'Save and continue' }),
    ).toBeVisible()
  },
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

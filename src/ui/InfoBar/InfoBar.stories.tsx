import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuShieldCheck } from 'react-icons/lu'

import { expect, fn, within } from 'storybook/test'

import { Button } from '../Button'
import { InfoBar, type UiInfoBarTone } from './InfoBar'

const TONES: UiInfoBarTone[] = ['info', 'success', 'warning', 'danger']

const meta = {
  title: 'UI/InfoBar',
  component: InfoBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    icon: { control: false, table: { disable: true } },
    badgeLabel: { control: 'text' },
    heading: { control: 'text' },
    children: { control: 'text' },
    linkLabel: { control: 'text' },
    linkHref: { control: 'text' },
    action: { control: false },
    hideBadge: { control: 'boolean' },
  },
  args: {
    tone: 'info',
    heading: 'You pay the worker directly',
    children:
      'Slashie never handles job payment. Agree a price with your worker and settle up between yourselves once the job is done.',
    linkLabel: 'How payments work',
    linkHref: '/help/safety',
  },
} satisfies Meta<typeof InfoBar>

export default meta
type Story = StoryObj<typeof meta>

/** The canonical payment-trust panel. */
export const Playground: Story = {}

/** Info (the default tone): neutral advisory such as the payment-trust notice. */
export const Info: Story = { args: { tone: 'info' } }

/** Success: confirmation such as an accepted quote. */
export const Success: Story = {
  args: {
    tone: 'success',
    heading: 'Quote accepted: £85 agreed',
    badgeLabel: 'Confirmed',
    children:
      'You and your worker have agreed £85 for the flat clearance in Hackney. Payment is arranged directly between the two of you.',
    linkLabel: 'View the job',
    linkHref: '/tasks/flat-clearance-hackney',
  },
}

/** Warning: caution before the user acts, such as releasing payment. */
export const Warning: Story = {
  args: {
    tone: 'warning',
    heading: 'Confirm before you pay',
    children:
      'Only release payment once the work is done and you are happy. Never send money up front for the gardening job in Richmond.',
    linkLabel: 'Read our safety tips',
  },
}

/** Danger: something looks wrong and needs action, such as a risky request. */
export const Danger: Story = {
  args: {
    tone: 'danger',
    heading: 'This request looks unusual',
    children:
      'A worker has asked for a £150 deposit before starting the Camden removals job. Slashie never asks you to pay through the app, so treat upfront-deposit requests with caution.',
    linkLabel: 'Report this message',
  },
}

/** Without link: heading, badge and body, no call to action. */
export const WithoutLink: Story = {
  args: { linkLabel: undefined, linkHref: undefined },
}

/** With an action: a button under the body (here one that opens a dialog). */
export const WithAction: Story = {
  args: {
    tone: 'warning',
    hideBadge: true,
    heading: 'This booking is on hold',
    children: 'Choose what happens next before the job day.',
    linkLabel: undefined,
    linkHref: undefined,
    action: (
      <Button size="sm" variant="primary" onClick={fn()}>
        Choose
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { name: 'This booking is on hold' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Choose' })).toBeEnabled()
  },
}

/** Heading only: no body copy and no link. */
export const HeadingOnly: Story = {
  args: { children: undefined, linkLabel: undefined, linkHref: undefined },
}

/** Long text: heading, body and link wrap inside a narrow panel. */
export const LongText: Story = {
  args: {
    heading:
      'You pay the worker directly once the job is finished and you are happy with it',
    children:
      'Slashie never handles job payment. Agree a price with your worker before they start, keep every message in the app, and settle up between yourselves once the job is done. If anything changes on the day, agree it in writing first.',
  },
  render: (args) => (
    <Box maxW="360px">
      <InfoBar {...args} />
    </Box>
  ),
}

/** Phone: tighter padding and smaller type below `md`. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Every tone uses an icon pod and a Badge (dot plus label), never colour alone. */
export const AllTones: Story = {
  render: () => (
    <Stack gap={4} maxW="640px">
      <InfoBar
        tone="info"
        heading="You pay the worker directly"
        linkLabel="How payments work"
        linkHref="/help/safety"
      >
        Slashie never handles job payment. Agree your price with the worker and
        settle up between yourselves once the job in Clapham is finished.
      </InfoBar>
      <InfoBar
        tone="success"
        heading="Quote accepted: £85 agreed"
        badgeLabel="Confirmed"
        linkLabel="View the job"
        linkHref="/tasks/flat-clearance-hackney"
      >
        You and your worker have agreed £85 for the flat clearance in Hackney.
        Payment is arranged directly between the two of you.
      </InfoBar>
      <InfoBar
        tone="warning"
        heading="Confirm before you pay"
        linkLabel="Read our safety tips"
        linkHref="/help/safety"
      >
        Only release payment once the work is done and you are happy. Never send
        money up front for the gardening job in Richmond.
      </InfoBar>
      <InfoBar
        tone="danger"
        heading="This request looks unusual"
        linkLabel="Report this message"
        linkHref="/help/safety"
      >
        A worker has asked for a £150 deposit to your bank before starting the
        Camden removals job. Slashie never asks you to pay through the app, so
        treat upfront-deposit requests with caution.
      </InfoBar>
    </Stack>
  ),
}

/** Custom leading icon (any Lucide/SVG node) and badge label. */
export const CustomIcon: Story = {
  args: {
    tone: 'info',
    icon: <LuShieldCheck size={20} />,
    badgeLabel: 'Secure',
    heading: 'Keep payments off-platform and in person',
    children:
      'Meet your worker at the property in Islington, check the work, then pay by cash or bank transfer. Slashie only connects you and never holds your money.',
    linkLabel: 'See payment guidance',
    linkHref: '/help/safety',
  },
}

/** Compact panel without the status Badge (icon pod still carries the tone). */
export const NoBadge: Story = {
  args: {
    tone: 'info',
    hideBadge: true,
    heading: 'Payment is between you and the worker',
    children:
      'Settle the £40 agreed for the Greenwich dog-walking job directly with your worker.',
    linkLabel: undefined,
    linkHref: undefined,
  },
}

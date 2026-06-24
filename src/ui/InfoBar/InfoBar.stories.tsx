import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { InfoBar, type UiInfoBarTone } from './InfoBar'

const TONES: UiInfoBarTone[] = ['info', 'success', 'warning', 'danger']

const meta = {
  title: 'Patterns/InfoBar',
  component: InfoBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    icon: { control: 'text' },
    badgeLabel: { control: 'text' },
    heading: { control: 'text' },
    children: { control: 'text' },
    linkLabel: { control: 'text' },
    linkHref: { control: 'text' },
    hideBadge: { control: 'boolean' },
  },
  args: {
    tone: 'info',
    heading: 'You pay the worker directly',
    children:
      'Slashie never handles job payment. Agree a price with your worker and settle up between yourselves once the job is done.',
    linkLabel: 'How payments work',
    linkHref: '/help/payments',
  },
} satisfies Meta<typeof InfoBar>

export default meta
type Story = StoryObj<typeof meta>

/** The canonical payment-trust panel. */
export const Playground: Story = {}

/** Every tone uses an icon pod + Badge (dot + label) — never colour alone. */
export const AllTones: Story = {
  render: () => (
    <Stack gap={4} maxW="640px">
      <InfoBar
        tone="info"
        heading="You pay the worker directly"
        linkLabel="How payments work"
        linkHref="/help/payments"
      >
        Slashie never handles job payment. Agree your price with the worker and
        settle up between yourselves once the job in Clapham is finished.
      </InfoBar>
      <InfoBar
        tone="success"
        heading="Quote accepted — £85 agreed"
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
        linkHref="/help/staying-safe"
      >
        Only release payment once the work is done and you are happy. Never send
        money up front for the gardening job in Richmond.
      </InfoBar>
      <InfoBar
        tone="danger"
        heading="This request looks unusual"
        linkLabel="Report this message"
        linkHref="/help/report"
      >
        A worker has asked for a £150 deposit to your bank before starting the
        Camden removals job. Slashie never asks you to pay through the app, so
        treat upfront-deposit requests with caution.
      </InfoBar>
    </Stack>
  ),
}

/** Custom leading icon and badge label. */
export const CustomIcon: Story = {
  args: {
    tone: 'info',
    icon: '🔒',
    badgeLabel: 'Secure',
    heading: 'Keep payments off-platform and in person',
    children:
      'Meet your worker at the property in Islington, check the work, then pay by cash or bank transfer. Slashie only connects you — we never hold your money.',
    linkLabel: 'See payment guidance',
    linkHref: '/help/payments',
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

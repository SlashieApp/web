import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Badge, type UiBadgeVariant } from './Badge'

const FAMILIES: UiBadgeVariant[] = [
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
]

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: FAMILIES },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'success', size: 'sm', dot: true, children: 'Open' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Playground: drive variant, size, dot and label from Controls. */
export const Playground: Story = {}

/** Success: positive state such as Completed (`brand` renders the same). A 1px border from the family. */
export const Success: Story = {
  args: { variant: 'success', children: 'Completed' },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Completed')
    const style = getComputedStyle(badge)
    await expect(style.borderTopWidth).toBe('1px')
    await expect(style.borderTopColor).toBe('rgb(198, 246, 221)')
    await expect(style.fontWeight).toBe('500')
  },
}

/** Warning: needs attention soon, such as a quote that is waiting. */
export const Warning: Story = {
  args: { variant: 'warning', children: 'Awaiting quote' },
}

/** Danger: problem or terminal negative state such as Cancelled. */
export const Danger: Story = {
  args: { variant: 'danger', children: 'Cancelled' },
}

/** Info: neutral progress such as In progress. */
export const Info: Story = {
  args: { variant: 'info', children: 'In progress' },
}

/** Neutral (the default): categories, and inactive or low-emphasis state such as Draft. */
export const Neutral: Story = {
  args: { variant: 'neutral', children: 'Draft' },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Draft')
    const style = getComputedStyle(badge)
    await expect(style.backgroundColor).toBe('rgb(244, 244, 245)')
    await expect(style.color).toBe('rgb(82, 82, 91)')
    await expect(style.borderTopColor).toBe('rgb(228, 228, 231)')
  },
}

/** Small (`sm`, the default): 12px text for dense rows. */
export const Small: Story = { args: { size: 'sm' } }

/** Small is the app's Badge box (FE-442): 26px tall, with or without the dot. */
export const SmallHeight: Story = {
  render: () => (
    <HStack gap={2} alignItems="center">
      <Badge variant="info" size="sm" dot>
        With dot
      </Badge>
      <Badge variant="neutral" size="sm" shape="pill">
        No dot
      </Badge>
    </HStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const label of ['With dot', 'No dot']) {
      const badge = canvas.getByText(label)
      await expect(badge.getBoundingClientRect().height).toBeCloseTo(26, 0)
    }
  },
}

/** Large (`lg`): 14px text for headers and detail panels. */
export const Large: Story = { args: { size: 'lg' } }

/** Default shape: a pill too since the tone refresh; `shape` stays only so old call sites need no change. */
export const DefaultShape: Story = { args: { shape: 'default' } }

/** Pill shape: fully rounded, used for counts and status chips. */
export const Pill: Story = {
  args: { shape: 'pill' },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Open')
    await expect(getComputedStyle(badge).borderTopLeftRadius).toBe('9999px')
  },
}

/** With dot: the leading status dot keeps meaning from relying on colour alone. */
export const WithDot: Story = { args: { dot: true } }

/** Without dot: label only, for non-status tags. */
export const WithoutDot: Story = { args: { dot: false } }

/** Long label: the badge stays on one line and grows with its text. */
export const LongLabel: Story = {
  args: { children: 'Waiting for the other person to confirm' },
}

/** Overview: every status family side by side, each with its dot. */
export const AllFamilies: Story = {
  render: () => (
    <HStack gap={2} flexWrap="wrap">
      {FAMILIES.map((variant) => (
        <Badge key={variant} variant={variant} dot>
          {variant}
        </Badge>
      ))}
    </HStack>
  ),
}

/** Overview: with the status dot next to without it. */
export const WithAndWithoutDot: Story = {
  render: () => (
    <Stack gap={3}>
      <HStack gap={2}>
        <Badge variant="success" dot>
          With dot
        </Badge>
        <Badge variant="success">No dot</Badge>
      </HStack>
    </Stack>
  ),
}

/** Overview: small (`sm`) next to large (`lg`). */
export const Sizes: Story = {
  render: () => (
    <HStack gap={2} alignItems="center">
      <Badge variant="info" size="sm" dot>
        Small
      </Badge>
      <Badge variant="info" size="lg" dot>
        Large
      </Badge>
    </HStack>
  ),
}

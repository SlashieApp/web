import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
    shape: { control: 'inline-radio', options: ['default', 'pill'] },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'success', size: 'sm', dot: true, children: 'Open' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/** Playground: drive variant, size, shape, dot and label from Controls. */
export const Playground: Story = {}

/** Success: positive state such as Completed (`brand`, the default, renders the same). */
export const Success: Story = {
  args: { variant: 'success', children: 'Completed' },
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

/** Neutral: inactive or low-emphasis state such as Draft. */
export const Neutral: Story = {
  args: { variant: 'neutral', children: 'Draft' },
}

/** Small (`sm`, the default): 12px text for dense rows. */
export const Small: Story = { args: { size: 'sm' } }

/** Large (`lg`): 14px text for headers and detail panels. */
export const Large: Story = { args: { size: 'lg' } }

/** Default shape: `md` corner radius. */
export const DefaultShape: Story = { args: { shape: 'default' } }

/** Pill shape: fully rounded, used for counts and status chips. */
export const Pill: Story = { args: { shape: 'pill' } }

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

import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Rating } from './Rating'

const meta = {
  title: 'Components/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: {
      control: 'text',
      description: 'Score to display (e.g. "4.9", or "—" when no reviews).',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Visual density.',
    },
    label: {
      control: 'text',
      description: 'Accessible context for the score (becomes aria-label).',
    },
  },
  args: {
    value: '4.9',
    size: 'md',
  },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: '4.9' },
}

export const Small: Story = {
  args: { value: '4.9', size: 'sm' },
}

export const NoReviewsYet: Story = {
  args: { value: '—', label: 'Rating' },
}

export const WithLabel: Story = {
  args: { value: '5.0', label: 'Worker rating' },
}

/** Overview of every size at a range of representative scores. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      {(['md', 'sm'] as const).map((size) => (
        <Stack key={size} gap={2}>
          <Text fontSize="xs" fontWeight={600} color="text.muted">
            size: {size}
          </Text>
          <HStack gap={6}>
            <Rating value="5.0" size={size} />
            <Rating value="4.9" size={size} />
            <Rating value="4.2" size={size} />
            <Rating value="3.5" size={size} />
            <Rating value="—" size={size} />
          </HStack>
        </Stack>
      ))}
    </Stack>
  ),
}

/** Side-by-side comparison, as used on profile cards. */
export const ProfileComparison: Story = {
  render: () => (
    <HStack gap={4}>
      <Rating value="5.0" label="Top rated" />
      <Rating value="4.2" label="Worker rating" />
    </HStack>
  ),
}

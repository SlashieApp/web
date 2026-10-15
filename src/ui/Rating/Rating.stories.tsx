import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Rating, RatingStars } from './Rating'

const meta = {
  title: 'UI/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: {
      control: 'text',
      description: 'Score to display (e.g. "4.9", or "–" when no reviews).',
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

/** Default: amber star and score at the md size. */
export const Default: Story = {
  args: { value: '4.9' },
}

/** Small: the compact sm density used on dense cards. */
export const Small: Story = {
  args: { value: '4.9', size: 'sm' },
}

/** No reviews yet: a placeholder dash stands in for the score. */
export const NoReviewsYet: Story = {
  args: { value: '–', label: 'Rating' },
}

/** With label: the aria-label gives the score context for screen readers. */
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
            <Rating value="–" size={size} />
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

/** RatingStars: four of five stars filled at the md size (review rows). */
export const Stars: Story = {
  parameters: { controls: { disable: true } },
  render: () => <RatingStars value={4} label="Job rating" />,
}

/** RatingStars, all filled: a perfect five star score. */
export const StarsAllFilled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <RatingStars value={5} label="Job rating" />,
}

/** RatingStars, none filled: no stars given yet (muted outlines only). */
export const StarsNoneFilled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <RatingStars value={0} label="Job rating" />,
}

/** RatingStars, fractions: 3.6 rounds to the nearest whole star (four). */
export const StarsRoundedFraction: Story = {
  parameters: { controls: { disable: true } },
  render: () => <RatingStars value={3.6} label="Job rating" />,
}

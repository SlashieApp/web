import { HStack, Text, VStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Avatar, AvatarGroup } from './Avatar'

const taskOwnerSrc =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop'
const workerSrc =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop'

const meta = {
  title: 'ui/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    src: { control: 'text' },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'inline-radio',
      options: [undefined, 'online', 'away', 'busy', 'offline'],
    },
    href: { control: 'text' },
  },
  args: {
    name: 'Alex Morgan',
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/** Image-only avatar (legacy default render path). */
export const Default: Story = {
  args: {
    name: 'Alex Morgan',
    src: taskOwnerSrc,
  },
}

/** Avatar with the name column beside the image. */
export const WithLabel: Story = {
  args: {
    name: 'Alex Morgan',
    label: 'Alex Morgan',
    src: taskOwnerSrc,
  },
}

/** No `src` → SDL initials fallback on `bg.subtle`. */
export const InitialsFallback: Story = {
  args: {
    name: 'Sam Taylor',
    label: 'Sam Taylor',
  },
}

/** Failed / missing URLs → user icon when `fallback="icon"`. */
export const IconFallback: Story = {
  args: {
    name: 'Sam Taylor',
    srcCandidates: ['https://invalid.example/missing.jpg'],
    fallback: 'icon',
  },
}

/** Presence dot is paired with a visually-hidden label (never colour alone). */
export const WithStatus: Story = {
  args: {
    name: 'Jordan Lee',
    label: 'Jordan Lee',
    src: workerSrc,
    status: 'online',
  },
}

/** Interactive avatar: focusable, visible focus ring, >=44px hit area. */
export const Interactive: Story = {
  args: {
    name: 'Alex Morgan',
    src: taskOwnerSrc,
    href: '#profile',
  },
}

export const Sizes: Story = {
  args: { name: 'Alex Morgan' },
  render: () => (
    <HStack gap={4} align="center">
      <Avatar name="Alex Morgan" src={taskOwnerSrc} size="sm" />
      <Avatar name="Alex Morgan" src={taskOwnerSrc} size="md" />
      <Avatar name="Alex Morgan" src={taskOwnerSrc} size="lg" />
    </HStack>
  ),
}

export const Statuses: Story = {
  args: { name: 'Alex Morgan' },
  render: () => (
    <HStack gap={4} align="center">
      <Avatar name="Online" src={taskOwnerSrc} size="lg" status="online" />
      <Avatar name="Away" src={workerSrc} size="lg" status="away" />
      <Avatar name="Busy" src={taskOwnerSrc} size="lg" status="busy" />
      <Avatar name="Offline" src={workerSrc} size="lg" status="offline" />
    </HStack>
  ),
}

export const Group: Story = {
  args: { name: 'Alex Morgan' },
  render: () => (
    <AvatarGroup
      size="lg"
      max={3}
      items={[
        { name: 'Alex Morgan', src: taskOwnerSrc },
        { name: 'Jordan Lee', src: workerSrc },
        { name: 'Sam Taylor' },
        { name: 'Robin Diaz' },
        { name: 'Casey Park' },
      ]}
    />
  ),
}

/** Overview across sizes, fallbacks, presence and grouping (light + dark). */
export const AllVariants: Story = {
  args: { name: 'Alex Morgan' },
  render: () => (
    <VStack align="start" gap={6}>
      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          Sizes
        </Text>
        <HStack gap={4} align="center">
          <Avatar name="Alex Morgan" src={taskOwnerSrc} size="sm" />
          <Avatar name="Alex Morgan" src={taskOwnerSrc} size="md" />
          <Avatar name="Alex Morgan" src={taskOwnerSrc} size="lg" />
        </HStack>
      </VStack>

      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          Initials fallback
        </Text>
        <HStack gap={4} align="center">
          <Avatar name="Sam Taylor" size="sm" />
          <Avatar name="Jordan Lee" size="md" />
          <Avatar name="Robin Diaz" size="lg" />
        </HStack>
      </VStack>

      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          Presence
        </Text>
        <HStack gap={4} align="center">
          <Avatar name="Online" src={taskOwnerSrc} size="lg" status="online" />
          <Avatar name="Away" src={workerSrc} size="lg" status="away" />
          <Avatar name="Busy" src={taskOwnerSrc} size="lg" status="busy" />
          <Avatar name="Offline" src={workerSrc} size="lg" status="offline" />
        </HStack>
      </VStack>

      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          With label
        </Text>
        <VStack align="start" gap={3}>
          <Avatar name="Alex Morgan" label="Alex Morgan" src={taskOwnerSrc} />
          <Avatar name="Jordan Lee" label="Jordan Lee" src={workerSrc} />
          <Avatar name="Sam Taylor" label="Sam Taylor" />
        </VStack>
      </VStack>

      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          Group
        </Text>
        <AvatarGroup
          size="lg"
          max={3}
          items={[
            { name: 'Alex Morgan', src: taskOwnerSrc },
            { name: 'Jordan Lee', src: workerSrc },
            { name: 'Sam Taylor' },
            { name: 'Robin Diaz' },
            { name: 'Casey Park' },
          ]}
        />
      </VStack>

      <VStack align="start" gap={2}>
        <Text fontSize="xs" fontWeight={600} color="text.muted">
          Interactive (focusable)
        </Text>
        <HStack gap={4} align="center">
          <Avatar name="Alex Morgan" src={taskOwnerSrc} size="lg" href="#a" />
          <Avatar name="Jordan Lee" size="lg" href="#b" />
        </HStack>
      </VStack>
    </VStack>
  ),
}

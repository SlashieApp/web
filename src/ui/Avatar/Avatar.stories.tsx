import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor } from 'storybook/test'

import { Avatar, AvatarGroup } from './Avatar'

/** Inline SVG portrait (head and shoulders), so stories never fetch a photo. */
function portrait(background: string, figure: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${background}"/><circle cx="64" cy="50" r="22" fill="${figure}"/><path d="M20 128c0-26 20-44 44-44s44 18 44 44z" fill="${figure}"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const taskOwnerSrc = portrait('#cfe3f4', '#3d6f9e')
const workerSrc = portrait('#f5dfc4', '#b5712e')
/** Not a decodable image: fires `onError` without any network request. */
const brokenSrc = 'data:image/png;base64,AAAA'

const meta = {
  title: 'UI/Avatar',
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
    srcCandidates: [brokenSrc],
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

/** Interactive as a button: `onClick` without `href`, same ring and hit area. */
export const InteractiveButton: Story = {
  args: { name: 'Alex Morgan', src: taskOwnerSrc, onClick: fn() },
}

/** Small (`sm`): 24px, for dense rows. */
export const Small: Story = {
  args: { name: 'Alex Morgan', src: taskOwnerSrc, size: 'sm' },
}

/** Medium (`md`, the default): 24px on phones, 28px from `md` up. */
export const Medium: Story = {
  args: { name: 'Alex Morgan', src: taskOwnerSrc, size: 'md' },
}

/** Large (`lg`): 40px, for card and list headers. */
export const Large: Story = {
  args: { name: 'Alex Morgan', src: taskOwnerSrc, size: 'lg' },
}

/** Extra large (`xl`): 96px profile-hero size. */
export const ExtraLarge: Story = {
  args: { name: 'Alex Morgan', src: taskOwnerSrc, size: 'xl' },
}

/** Initials, single-word name: the first two letters are used. */
export const InitialsSingleName: Story = {
  args: { name: 'Nova', size: 'lg' },
}

/** Initials, long name: only the first and last word count. */
export const InitialsLongName: Story = {
  args: { name: 'Maria Fernanda Lopez Garcia', size: 'lg' },
}

/** Fallback chain: the first candidate fails to load, so the next one is used. */
export const FallbackChain: Story = {
  args: {
    name: 'Alex Morgan',
    srcCandidates: [brokenSrc, taskOwnerSrc],
    size: 'lg',
  },
  play: async ({ canvasElement }) => {
    await waitFor(
      () =>
        expect(canvasElement.querySelector('img')).toHaveAttribute(
          'src',
          taskOwnerSrc,
        ),
      { timeout: 3000 },
    )
  },
}

/** Presence online: green dot plus a visually-hidden "Online" label. */
export const StatusOnline: Story = {
  args: { name: 'Jordan Lee', src: workerSrc, size: 'lg', status: 'online' },
}

/** Presence away: amber dot plus a visually-hidden "Away" label. */
export const StatusAway: Story = {
  args: { name: 'Jordan Lee', src: workerSrc, size: 'lg', status: 'away' },
}

/** Presence busy: red dot plus a visually-hidden "Busy" label. */
export const StatusBusy: Story = {
  args: { name: 'Jordan Lee', src: workerSrc, size: 'lg', status: 'busy' },
}

/** Presence offline: neutral dot plus a visually-hidden "Offline" label. */
export const StatusOffline: Story = {
  args: { name: 'Jordan Lee', src: workerSrc, size: 'lg', status: 'offline' },
}

/** Long label: the name truncates with an ellipsis in a narrow row. */
export const LongLabel: Story = {
  args: {
    name: 'Alexandria Montgomery-Featherstone',
    label: 'Alexandria Montgomery-Featherstone',
    src: taskOwnerSrc,
  },
  render: (args) => (
    <Box maxW="180px">
      <Avatar {...args} />
    </Box>
  ),
}

/** Group within the limit: no +N chip when every item fits. */
export const GroupWithoutOverflow: Story = {
  render: () => (
    <AvatarGroup
      size="lg"
      max={4}
      items={[
        { name: 'Alex Morgan', src: taskOwnerSrc },
        { name: 'Jordan Lee', src: workerSrc },
        { name: 'Sam Taylor' },
      ]}
    />
  ),
}

/** Sizes: sm, md and lg side by side. */
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

/** Presence: online, away, busy and offline side by side. */
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

/** Group: overlapping stack with a +N chip once items exceed `max`. */
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

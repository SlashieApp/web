import { Box, Text } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuCheck, LuMapPin } from 'react-icons/lu'
import { expect, fn, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import {
  DemoCard,
  DemoPrimary,
  Hotspot,
  InitialAvatar,
  MetaChip,
  PhoneTabBar,
  Stars,
} from './phoneParts'

const copy = messages.en.landing.phone

/** Story-only: a phone-width strip, since the tab bar is absolutely placed. */
const withTabBarStrip: Decorator = (Story) => (
  <Box position="relative" w="375px" h="130px" bg="bg.canvas">
    <Story />
  </Box>
)

/** Story-only: a phone-width column for the parts that fill their width. */
const withColumn: Decorator = (Story) => (
  <Box w="300px" p={4} borderRadius="lg" bg="bg.canvas">
    <Story />
  </Box>
)

/** Gallery of the small in-phone parts the demo screens are built from. */
const meta = {
  title: 'Marketing/Landing/PhoneParts',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Tab bar, Search tab active, no unread badge. */
export const TabBar: Story = {
  decorators: [withTabBarStrip],
  render: () => <PhoneTabBar copy={copy.nav} active="search" />,
}

/** Tab bar with unread messages: the count badge sits on the Messages icon. */
export const TabBarUnread: Story = {
  decorators: [withTabBarStrip],
  render: () => <PhoneTabBar copy={copy.nav} active="search" unread={2} />,
}

/** Tab bar, My tasks tab active. */
export const TabBarMyTasks: Story = {
  decorators: [withTabBarStrip],
  render: () => <PhoneTabBar copy={copy.nav} active="myTasks" />,
}

/** Tab bar, Messages tab active, with an unread badge. */
export const TabBarMessages: Story = {
  decorators: [withTabBarStrip],
  render: () => <PhoneTabBar copy={copy.nav} active="messages" unread={1} />,
}

/** Tab bar, Account tab active (the worker profile screen). */
export const TabBarAccount: Story = {
  decorators: [withTabBarStrip],
  render: () => <PhoneTabBar copy={copy.nav} active="account" unread={1} />,
}

/** Hotspot before the beat has played: the green ring pulses, "tap me". */
export const HotspotPulsing: Story = {
  decorators: [withColumn],
  render: () => (
    <Hotspot label={copy.post.submit} onPress={fn()} pulse w="full">
      <DemoPrimary>{copy.post.submit}</DemoPrimary>
    </Hotspot>
  ),
}

/** Hotspot after the beat has played: the ring is gone, still a real button. */
export const HotspotPlayed: Story = {
  decorators: [withColumn],
  render: () => (
    <Hotspot label={copy.post.submit} onPress={fn()} pulse={false} w="full">
      <DemoPrimary>{copy.post.submit}</DemoPrimary>
    </Hotspot>
  ),
}

/** Hotspot with keyboard focus: the SDL focus ring shows on the button. */
export const HotspotFocused: Story = {
  decorators: [withColumn],
  render: () => (
    <Hotspot label={copy.post.submit} onPress={fn()} pulse={false} w="full">
      <DemoPrimary>{copy.post.submit}</DemoPrimary>
    </Hotspot>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(
      within(canvasElement).getByRole('button', { name: copy.post.submit }),
    ).toHaveFocus()
  },
}

/** Initials avatar at the default 40px. */
export const Avatar: Story = {
  render: () => <InitialAvatar initials={copy.profile.initials} />,
}

/** Initials avatar at 80px, as on the worker profile. */
export const AvatarLarge: Story = {
  render: () => <InitialAvatar initials={copy.profile.initials} size={80} />,
}

/** Five of five stars filled (the demo's quotes and reviews). */
export const StarsFive: Story = {
  render: () => <Stars filled={5} />,
}

/** Three of five stars filled: the rest show as outlines. */
export const StarsPartial: Story = {
  render: () => <Stars filled={3} />,
}

/** Plain meta chip: a grey pill with one line of text. */
export const MetaChipText: Story = {
  render: () => <MetaChip>{copy.quotes.category}</MetaChip>,
}

/** Meta chip with a leading icon, as in the task detail header. */
export const MetaChipWithIcon: Story = {
  render: () => (
    <MetaChip>
      <LuMapPin size={12} aria-hidden />
      {copy.tasks.hedge.area}
    </MetaChip>
  ),
}

/** Demo card: the white bordered surface the screens stack their content on. */
export const SurfaceCard: Story = {
  decorators: [withColumn],
  render: () => (
    <DemoCard>
      <Text fontSize="15px" fontWeight={700}>
        {copy.tasks.hedge.title}
      </Text>
      <Text fontSize="13px" color="text.muted">
        {copy.tasks.hedge.area}
      </Text>
    </DemoCard>
  ),
}

/** Primary button look at rest: green fill with dark ink. */
export const PrimaryButton: Story = {
  decorators: [withColumn],
  render: () => <DemoPrimary>{copy.post.submit}</DemoPrimary>,
}

/** Primary button after the beat: a check icon leads the confirmation label. */
export const PrimaryButtonDone: Story = {
  decorators: [withColumn],
  render: () => (
    <DemoPrimary>
      <LuCheck size={18} aria-hidden />
      {copy.post.postedTitle}
    </DemoPrimary>
  ),
}

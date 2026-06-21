import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuClock3, LuShieldCheck } from 'react-icons/lu'

import { Tag } from './Tag'

function IconClockSmall() {
  return (
    <Box as="span" display="inline-flex" w="14px" h="14px" flexShrink={0}>
      <LuClock3 size={14} strokeWidth={2} aria-hidden />
    </Box>
  )
}

function IconShieldCheck() {
  return (
    <Box as="span" display="inline-flex" w="14px" h="14px" flexShrink={0}>
      <LuShieldCheck size={14} strokeWidth={2} aria-hidden />
    </Box>
  )
}

const meta = {
  title: 'ui/Tag/Ghost',
  component: Tag,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const PostedHoursAgo: Story = {
  render: () => (
    <Tag variant="ghost" color={null} icon={<IconClockSmall />}>
      Posted 2 hours ago
    </Tag>
  ),
}

export const VerifiedPoster: Story = {
  render: () => (
    <Tag variant="ghost" color="tertiary" icon={<IconShieldCheck />}>
      Verified poster
    </Tag>
  ),
}

export const ScheduleToday: Story = {
  render: () => (
    <Tag variant="ghost" color="primary" icon={<IconClockSmall />}>
      Today
    </Tag>
  ),
}

export const ScheduleOverdue: Story = {
  render: () => (
    <Tag variant="ghost" color="danger" icon={<IconClockSmall />}>
      Overdue
    </Tag>
  ),
}

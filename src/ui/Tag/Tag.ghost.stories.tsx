import { Box, HStack, Stack, Text } from '@chakra-ui/react'
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
  parameters: {
    layout: 'padded',
  },
  args: {
    variant: 'ghost' as const,
    color: null,
    children: 'Posted 2 hours ago',
    icon: <IconClockSmall />,
  },
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const GreyWithIcon: Story = {
  args: {
    variant: 'ghost',
    color: null,
    icon: <IconClockSmall />,
    children: 'Posted 2 hours ago',
  },
}

export const TertiaryWithIcon: Story = {
  args: {
    variant: 'ghost',
    color: 'tertiary',
    icon: <IconShieldCheck />,
    children: 'Verified Poster',
  },
}

export const Primary: Story = {
  args: {
    variant: 'ghost',
    color: 'primary',
    children: 'Verified worker',
  },
}

export const Danger: Story = {
  args: {
    variant: 'ghost',
    color: 'danger',
    children: 'Action required',
  },
}

export const PrimaryWithIcon: Story = {
  args: {
    variant: 'ghost',
    color: 'primary',
    icon: <IconClockSmall />,
    children: 'Verified worker',
  },
}

export const DangerWithIcon: Story = {
  args: {
    variant: 'ghost',
    color: 'danger',
    icon: <IconClockSmall />,
    children: 'Action required',
  },
}

export const Overview: Story = {
  render: () => (
    <Stack gap={5} align="flex-start">
      <Text fontSize="sm" color="formLabelMuted">
        Ghost: transparent background. Use color and icon together on every
        tint.
      </Text>
      <HStack gap={6} flexWrap="wrap" align="center">
        <Tag variant="ghost" color={null} icon={<IconClockSmall />}>
          Posted 2 hours ago
        </Tag>
        <Tag variant="ghost" color="tertiary" icon={<IconShieldCheck />}>
          Verified Poster
        </Tag>
      </HStack>
      <HStack gap={4} flexWrap="wrap" align="center">
        <Tag variant="ghost" color="primary" icon={<IconClockSmall />}>
          Primary
        </Tag>
        <Tag variant="ghost" color="tertiary" icon={<IconShieldCheck />}>
          Tertiary
        </Tag>
        <Tag variant="ghost" color="danger" icon={<IconClockSmall />}>
          Danger
        </Tag>
        <Tag variant="ghost" color={null} icon={<IconClockSmall />}>
          Grey
        </Tag>
      </HStack>
    </Stack>
  ),
}

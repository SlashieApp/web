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
  title: 'ui/Tag/Default',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    variant: 'default' as const,
    children: 'Active task',
    color: 'primary' as const,
  },
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    color: 'primary',
    children: 'Active task',
  },
}

export const Tertiary: Story = {
  args: {
    color: 'tertiary',
    children: 'Pending quote',
  },
}

export const Danger: Story = {
  args: {
    color: 'danger',
    children: 'Urgent',
  },
}

export const Grey: Story = {
  args: {
    color: null,
    children: 'Neutral',
  },
}

export const PrimaryWithIcon: Story = {
  args: {
    color: 'primary',
    icon: <IconClockSmall />,
    children: 'Active task',
  },
}

export const TertiaryWithIcon: Story = {
  args: {
    color: 'tertiary',
    icon: <IconShieldCheck />,
    children: 'Pending quote',
  },
}

export const AllColors: Story = {
  render: () => (
    <Stack gap={4} bg="bg" p={6} borderRadius="lg" align="stretch">
      <Text fontSize="sm" color="formLabelMuted">
        Text only — default variant; pick a tint with the color prop.
      </Text>
      <HStack gap={3} flexWrap="wrap">
        <Tag variant="default" color="primary">
          Active task
        </Tag>
        <Tag variant="default" color="tertiary">
          Pending quote
        </Tag>
        <Tag variant="default" color="danger">
          Urgent
        </Tag>
        <Tag variant="default" color={null}>
          Neutral
        </Tag>
      </HStack>
      <Text fontSize="sm" color="formLabelMuted">
        With icon — color still drives pill, label, and icon together.
      </Text>
      <HStack gap={3} flexWrap="wrap">
        <Tag variant="default" color="primary" icon={<IconClockSmall />}>
          Active task
        </Tag>
        <Tag variant="default" color="tertiary" icon={<IconShieldCheck />}>
          Pending quote
        </Tag>
        <Tag variant="default" color="danger" icon={<IconClockSmall />}>
          Urgent
        </Tag>
        <Tag variant="default" color={null} icon={<IconClockSmall />}>
          Neutral
        </Tag>
      </HStack>
    </Stack>
  ),
}

import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

import {
  IconCalendar,
  IconClock,
  IconDocument,
  IconMapPin,
  IconSliders,
  IconWrench,
} from './TaskBrowseMetaIcons'

function TaskBrowseMetaIconsGallery() {
  return null
}

const meta = {
  title: 'ui/TaskBrowseMetaIcons',
  component: TaskBrowseMetaIconsGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TaskBrowseMetaIconsGallery>

export default meta

type Story = StoryObj<typeof meta>

function IconRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <HStack gap={3} align="center">
      {children}
      <Text fontSize="sm">{label}</Text>
    </HStack>
  )
}

export const AllIcons: Story = {
  args: {},
  render: () => (
    <Stack gap={4}>
      <IconRow label="IconMapPin">
        <IconMapPin />
      </IconRow>
      <IconRow label="IconClock">
        <IconClock />
      </IconRow>
      <IconRow label="IconWrench">
        <IconWrench />
      </IconRow>
      <IconRow label="IconSliders">
        <IconSliders />
      </IconRow>
      <IconRow label="IconCalendar">
        <IconCalendar />
      </IconRow>
      <IconRow label="IconDocument">
        <IconDocument />
      </IconRow>
    </Stack>
  ),
}

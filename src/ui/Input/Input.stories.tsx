import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuSearch } from 'react-icons/lu'

import { Input } from './Input'

const searchIcon = (
  <Box as="span" aria-hidden display="inline-flex">
    <LuSearch size={18} strokeWidth={2} />
  </Box>
)

const meta = {
  title: 'ui/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    startElement: { control: false, table: { disable: true } },
    endElement: { control: false, table: { disable: true } },
    rootProps: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const BrowseSearch: Story = {
  render: () => (
    <Input placeholder="Search tasks near you…" startElement={searchIcon} />
  ),
}

export const AuthEmail: Story = {
  render: () => <Input placeholder="you@example.com" type="email" />,
}

export const PostTaskTitle: Story = {
  render: () => <Input placeholder="e.g. Assemble flat-pack wardrobe" />,
}

export const DashboardFilterDisabled: Story = {
  render: () => <Input placeholder="Filter by keyword" disabled />,
}

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
  parameters: {
    layout: 'padded',
  },
  args: {
    placeholder: 'Search…',
  },
  argTypes: {
    startElement: { control: false, table: { disable: true } },
    endElement: { control: false, table: { disable: true } },
    rootProps: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithStartIcon: Story = {
  render: (args) => <Input {...args} startElement={searchIcon} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled',
  },
}

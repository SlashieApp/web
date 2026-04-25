import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuSearch } from 'react-icons/lu'

import { Input } from './Input'

const meta = {
  title: 'ui/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    placeholder: 'Search…',
    startElement: (
      <Box as="span" aria-hidden display="inline-flex">
        <LuSearch size={18} strokeWidth={2} />
      </Box>
    ),
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

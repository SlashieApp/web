import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MetaRow } from './MetaRow'
import { IconBudgetGrid, IconPin } from './VisitorMetaIcons'

const meta = {
  title: 'task/MetaSection/MetaRow',
  component: MetaRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MetaRow>

export default meta

type Story = StoryObj<typeof meta>

export const Location: Story = {
  args: {
    label: 'Location',
    icon: <IconPin />,
    children: 'Westminster, London',
    secondaryLine: 'Approximate area until you accept a quote',
  },
}

export const Budget: Story = {
  args: {
    label: 'Budget',
    icon: <IconBudgetGrid />,
    children: (
      <Text as="span" fontSize="sm" fontWeight={700}>
        £120 fixed
      </Text>
    ),
  },
}

export const ListRowWithDivider: Story = {
  args: {
    withDivider: true,
    children: <Text fontSize="sm">Row content with bottom divider</Text>,
  },
}

export const ListRowLast: Story = {
  args: {
    withDivider: false,
    children: <Text fontSize="sm">Last row without divider</Text>,
  },
}

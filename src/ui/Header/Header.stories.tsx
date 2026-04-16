import { HStack, Heading } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button'
import { Header } from './Header'

const meta = {
  title: 'layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const CustomChildren: Story = {}

export const SiteNavigation: Story = {
  render: () => <Header activeItem="home" />,
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Header } from '../Header'
import { SiteHeader } from './SiteHeader'

const meta: Meta<typeof SiteHeader> = {
  title: 'UI/Shell/SiteHeader',
  component: SiteHeader,
  args: {
    activeItem: 'post-job',
  },
  render: (args) => (
    <Header>
      <SiteHeader {...args} />
    </Header>
  ),
}

export default meta

type Story = StoryObj<typeof SiteHeader>

export const Default: Story = {}

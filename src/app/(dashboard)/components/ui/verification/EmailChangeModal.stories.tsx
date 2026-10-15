import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'

import { EmailChangeModal } from './EmailChangeModal'

const meta = {
  title: 'Dashboard/Shared/EmailChangeModal',
  component: EmailChangeModal,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: () => {} },
  render: (args) => {
    useUserStore.setState({
      me: { id: 'user-story', email: 'sam@example.com' } as MeSnapshot,
    })
    return <EmailChangeModal {...args} />
  },
} satisfies Meta<typeof EmailChangeModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

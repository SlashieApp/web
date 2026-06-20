import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountMenu } from './AccountMenu'
import { headerMeWorker, seedHeaderMeStore } from './headerStoryFixtures'

const meta = {
  title: 'header/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box display="flex" justifyContent="flex-end" p={6}>
        <Story />
      </Box>
    ),
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  args: {
    initialOpen: true,
  },
} satisfies Meta<typeof AccountMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

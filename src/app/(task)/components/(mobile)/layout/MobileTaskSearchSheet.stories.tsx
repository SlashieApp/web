import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseProvider } from '../../../context/TaskBrowseProvider'
import { TaskSearch } from '../../ui/TaskSearch'
import { TaskTag } from '../../ui/TaskTag'
import { MobileTaskSearchSheet } from './MobileTaskSearchSheet'

const meta: Meta = {
  title: 'Tasks/MobileTaskSearchSheet',
  parameters: { layout: 'padded', viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    // No map in the story, so results stay in their loading skeleton.
    <TaskBrowseProvider initialTasks={[]} isDesktop={false}>
      <Box maxW="420px" display="flex" flexDirection="column" gap={2}>
        <TaskSearch mode="trigger" />
        <TaskTag />
      </Box>
      <MobileTaskSearchSheet />
    </TaskBrowseProvider>
  ),
}

export default meta
type Story = StoryObj

/** Tap the bar to open the sheet (search field, chips, loading results). */
export const Collapsed: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskHeader } from './CreateTaskHeader'

const meta: Meta<typeof CreateTaskHeader> = {
  title: 'Create task/CreateTaskHeader',
  component: CreateTaskHeader,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: close button, logo and a centred title. */
export const Default: Story = {}

/** Started from a task: Close goes back there instead of the task browse. */
export const CustomExit: Story = {
  args: { exitHref: '/tasks/example' },
}

/** Phones: a shorter bar with the title left-aligned. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Card } from '../Card/Card'
import { type TabItem, Tabs } from './Tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const INFO_QUOTES: TabItem[] = [
  { key: 'info', label: 'Info' },
  { key: 'quotes', label: 'Quotes', badge: 3 },
]

function Panels() {
  return (
    <>
      <Tabs.Panel value="info">
        <Card layout="section" heading="Task details">
          <Text color="text.muted">
            About, location, category, budget and timing live here.
          </Text>
        </Card>
      </Tabs.Panel>
      <Tabs.Panel value="quotes">
        <Card layout="section" heading="Quotes">
          <Text color="text.muted">
            Three workers have quoted on this task.
          </Text>
        </Card>
      </Tabs.Panel>
    </>
  )
}

/** Uncontrolled, fitted (equal-width) — the mobile task-detail configuration. */
export const Fitted: Story = {
  args: { tabs: INFO_QUOTES, fitted: true, 'aria-label': 'Task sections' },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Non-fitted, left-aligned, with a count badge on the active tab. */
export const WithBadge: Story = {
  args: { tabs: INFO_QUOTES, 'aria-label': 'Task sections' },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

const MANY: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'activity', label: 'Activity', badge: 12 },
  { key: 'settings', label: 'Settings' },
  { key: 'archived', label: 'Archived', disabled: true },
]

export const ManyTabsWithDisabled: Story = {
  args: { tabs: MANY, 'aria-label': 'Sections' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.Panel value="overview">
        <Text>Overview panel</Text>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <Text>Activity panel</Text>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Text>Settings panel</Text>
      </Tabs.Panel>
      <Tabs.Panel value="archived">
        <Text>Archived panel</Text>
      </Tabs.Panel>
    </Tabs>
  ),
}

/** Controlled usage with external state. */
export const Controlled: Story = {
  args: { tabs: INFO_QUOTES, 'aria-label': 'Task sections' },
  render: (args) => {
    const [value, setValue] = useState('quotes')
    return (
      <Stack gap={3}>
        <Text fontSize="sm" color="text.muted">
          Active: {value}
        </Text>
        <Tabs {...args} value={value} onChange={setValue}>
          <Panels />
        </Tabs>
      </Stack>
    )
  },
}

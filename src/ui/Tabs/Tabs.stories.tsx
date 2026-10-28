import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { type ReactNode, useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Card } from '../Card/Card'
import { type TabItem, Tabs } from './Tabs'

const meta = {
  title: 'UI/Tabs',
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

/** Uncontrolled, fitted (equal-width): the mobile task-detail configuration. */
export const Fitted: Story = {
  args: { tabs: INFO_QUOTES, fitted: true, 'aria-label': 'Task sections' },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Non-fitted and left-aligned, with a count badge on an inactive tab. */
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

/** Many tabs: four sections, the last one disabled (arrow keys skip it). */
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

/** Equal-width below `lg`, left-aligned shrink-wrap from `lg` up. */
export const FittedBelowLg: Story = {
  args: {
    tabs: MANY,
    fittedBelowLg: true,
    'aria-label': 'Task sections',
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <Tabs {...args} sticky stickyHeader={<Text px={1}>Task title</Text>}>
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

/** Trailing slot beside a 2:1 tablist (task-detail money page). */
export const WithTabListAside: Story = {
  args: {
    tabs: INFO_QUOTES,
    fadeTabListBorder: true,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs
      {...args}
      tabListAside={
        <Card layout="section" density="compact" maxW="sm">
          <Text fontWeight={500}>Send a quote</Text>
        </Card>
      }
    >
      <Panels />
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

function ManyPanels() {
  return (
    <>
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
    </>
  )
}

/** Tall panels, so a scroll pane has something to scroll under a sticky bar. */
function TallPanels() {
  const rows = Array.from({ length: 8 }, (_, index) => index + 1)
  return (
    <>
      {['info', 'quotes'].map((value) => (
        <Tabs.Panel key={value} value={value}>
          <Stack gap={3}>
            {rows.map((row) => (
              <Card key={row} layout="section" heading={`Detail ${row}`}>
                <Text color="text.muted">
                  Scroll the pane to watch the tab bar stay put.
                </Text>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>
      ))}
    </>
  )
}

/** Story-only scroll pane; `scrolled` starts it past the natural tab bar position. */
function ScrollPane({
  scrolled = false,
  paneBg = 'bg.canvas',
  children,
}: {
  scrolled?: boolean
  paneBg?: string
  children: ReactNode
}) {
  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        if (!node || !scrolled) return
        requestAnimationFrame(() => {
          node.scrollTop = 200
        })
      }}
      h="360px"
      overflowY="auto"
      bg={paneBg}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      {children}
    </Box>
  )
}

/** Default value: uncontrolled, starting on the second tab. */
export const DefaultValue: Story = {
  args: {
    tabs: INFO_QUOTES,
    defaultValue: 'quotes',
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Sticky: the tab bar stays pinned while the panel scrolls beneath it. */
export const Sticky: Story = {
  args: { tabs: INFO_QUOTES, 'aria-label': 'Task sections' },
  render: (args) => (
    <ScrollPane scrolled>
      <Tabs
        {...args}
        px={4}
        sticky
        stickyHeader={
          <Text px={1} py={3} fontWeight={500}>
            Fix leaking kitchen tap
          </Text>
        }
      >
        <TallPanels />
      </Tabs>
    </ScrollPane>
  ),
}

/** Sticky, transparent: the bar has no background, the pane shows through. */
export const StickyTransparent: Story = {
  args: { tabs: INFO_QUOTES, 'aria-label': 'Task sections' },
  render: (args) => (
    <ScrollPane paneBg="status.info.soft">
      <Tabs {...args} px={4} sticky stickyBg="transparent">
        <TallPanels />
      </Tabs>
    </ScrollPane>
  ),
}

/** Panel background: `panelBg` gives the panels their own surface. */
export const PanelBackground: Story = {
  args: {
    tabs: INFO_QUOTES,
    panelBg: 'bg.surface',
    px: 4,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Faded border: the tablist hairline fades out by the halfway point. */
export const FadedTabListBorder: Story = {
  args: {
    tabs: INFO_QUOTES,
    fadeTabListBorder: true,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Capped tablist: `tabListMaxW` limits the tab bar to half of the width. */
export const TabListMaxWidth: Story = {
  args: {
    tabs: INFO_QUOTES,
    fadeTabListBorder: true,
    tabListMaxW: '50%',
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Hidden tab list: one section drops the tab bar and tab semantics. */
export const HiddenTabList: Story = {
  args: {
    tabs: [{ key: 'info', label: 'Info' }],
    hideTabList: true,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.Panel value="info">
        <Card layout="section" heading="Task details">
          <Text color="text.muted">
            With one section there is nothing to switch between.
          </Text>
        </Card>
      </Tabs.Panel>
    </Tabs>
  ),
}

/** Phone, fitted: two equal-width tabs fill the screen. */
export const FittedMobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { tabs: INFO_QUOTES, fitted: true, 'aria-label': 'Task sections' },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Phone, fitted below lg: the tabs share the width equally on a phone. */
export const FittedBelowLgMobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    tabs: INFO_QUOTES,
    fittedBelowLg: true,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
}

/** Phone with aside: the slot is hidden below lg, the bar keeps full width. */
export const TabListAsideMobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    tabs: INFO_QUOTES,
    fadeTabListBorder: true,
    'aria-label': 'Task sections',
  },
  render: (args) => (
    <Tabs
      {...args}
      tabListAside={
        <Card layout="section" density="compact" maxW="sm">
          <Text fontWeight={500}>Send a quote</Text>
        </Card>
      }
    >
      <Panels />
    </Tabs>
  ),
}

/** Keyboard: arrows, Home and End move between tabs, skipping disabled ones. */
export const KeyboardNavigation: Story = {
  args: { tabs: MANY, 'aria-label': 'Sections' },
  render: (args) => (
    <Tabs {...args}>
      <ManyPanels />
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tab = (name: RegExp) => canvas.getByRole('tab', { name })
    const expectSelected = (name: RegExp) =>
      waitFor(
        () => expect(tab(name)).toHaveAttribute('aria-selected', 'true'),
        {
          timeout: 3000,
        },
      )

    tab(/^Overview/).focus()
    await userEvent.keyboard('{ArrowRight}')
    await expectSelected(/^Activity/)
    await userEvent.keyboard('{ArrowRight}')
    await expectSelected(/^Settings/)
    // The disabled "Archived" tab is skipped, so the arrow wraps to the start.
    await userEvent.keyboard('{ArrowRight}')
    await expectSelected(/^Overview/)
    await userEvent.keyboard('{End}')
    await expectSelected(/^Settings/)
    await expect(tab(/^Archived/)).toHaveAttribute('aria-selected', 'false')
    await userEvent.keyboard('{Home}')
    await expectSelected(/^Overview/)
  },
}

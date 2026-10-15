import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardSectionNav } from './DashboardSectionNav'

const items = [
  { label: 'Overview', href: '#overview' },
  { label: 'Personal info', href: '#personal-info' },
  { label: 'Contact & verification', href: '#contact-verification' },
  { label: 'Worker profile', href: '#worker-profile' },
  { label: 'Preferences', href: '#preferences' },
]

const meta = {
  title: 'Dashboard/Shared/DashboardSectionNav',
  component: DashboardSectionNav,
  parameters: { layout: 'padded' },
  args: { items },
} satisfies Meta<typeof DashboardSectionNav>

export default meta
type Story = StoryObj<typeof meta>

/** No active link given: the first section is underlined. */
export const Default: Story = {}

/** A later section is active. */
export const ActiveSection: Story = {
  args: { activeHref: '#worker-profile' },
}

/** Phones: the row scrolls sideways when the links do not fit. */
export const PhoneOverflow: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { activeHref: '#contact-verification' },
}

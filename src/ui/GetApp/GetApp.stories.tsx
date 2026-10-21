import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { GetAppButton } from './GetAppButton'
import { GetAppDialog } from './GetAppDialog'

const meta = {
  title: 'UI/GetApp',
  component: GetAppDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { open: true, onOpenChange: fn(), showQr: true },
} satisfies Meta<typeof GetAppDialog>

export default meta
type Story = StoryObj<typeof meta>

function body(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body)
}

/** On a PC: the QR code (opens slashie.app on a phone) and both stores coming soon. */
export const OnPc: Story = {
  play: async ({ canvasElement }) => {
    const page = body(canvasElement)
    await waitFor(() =>
      expect(
        page.getByRole('dialog', { name: 'Get the Slashie app' }),
      ).toBeVisible(),
    )
    await expect(
      page.getByLabelText('QR code that opens slashie.app'),
    ).toBeInTheDocument()
    await expect(page.getAllByText('Coming soon')).toHaveLength(2)
    await expect(page.getByText('App Store')).toBeVisible()
    await expect(page.getByText('Google Play')).toBeVisible()
  },
}

/** On a phone, after the app didn't open: no QR, just the stores coming soon. */
export const OnPhone: Story = {
  args: { showQr: false },
  play: async ({ canvasElement }) => {
    const page = body(canvasElement)
    await waitFor(() => expect(page.getByRole('dialog')).toBeVisible())
    await expect(
      page.queryByLabelText('QR code that opens slashie.app'),
    ).toBeNull()
  },
}

/** The button on a PC browser opens the modal with the QR code. */
export const Button: Story = {
  args: { open: false },
  render: () => <GetAppButton variant="secondary" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Get app' }),
    )
    const page = body(canvasElement)
    await waitFor(() =>
      expect(
        page.getByLabelText('QR code that opens slashie.app'),
      ).toBeInTheDocument(),
    )
  },
}

/** Phone width. */
export const Mobile: Story = {
  args: { showQr: false },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/search' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        body(canvasElement).getByRole('dialog', {
          name: '下載 Slashie 應用程式',
        }),
      ).toBeVisible(),
    )
  },
}

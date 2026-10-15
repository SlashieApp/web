import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import type { AppLocale } from '@/i18n/locales'

import { Button } from '../Button/Button'
import { LanguageSwitcher } from './LanguageSwitcher'

const meta = {
  title: 'UI/LanguageSwitcher',
  component: LanguageSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    locale: 'en' as AppLocale,
    onSelect: fn(),
    open: false,
    onOpenChange: () => undefined,
  },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

function ControlledSwitcher({
  initialOpen = false,
  initialLocale = 'en',
  onSelect,
}: {
  initialOpen?: boolean
  initialLocale?: AppLocale
  onSelect?: (locale: AppLocale) => void
}) {
  const [locale, setLocale] = useState<AppLocale>(initialLocale)
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open language
      </Button>
      <LanguageSwitcher
        locale={locale}
        onSelect={(next) => {
          setLocale(next)
          onSelect?.(next)
        }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

/** Closed until the account-menu entry (or this story control) opens it. */
export const Default: Story = {
  render: (args) => <ControlledSwitcher onSelect={args.onSelect} />,
}

/** Full-page locale list. */
export const Open: Story = {
  render: (args) => <ControlledSwitcher initialOpen onSelect={args.onSelect} />,
}

/** Traditional Chinese active: its row is highlighted with the check mark. */
export const ChineseSelected: Story = {
  render: (args) => (
    <ControlledSwitcher
      initialOpen
      initialLocale="zh-hk"
      onSelect={args.onSelect}
    />
  ),
}

/** Phone: the list fills the narrow viewport. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => <ControlledSwitcher initialOpen onSelect={args.onSelect} />,
}

/** Picking a locale: choosing Traditional Chinese reports it and closes the list. */
export const PicksLocale: Story = {
  render: (args) => <ControlledSwitcher onSelect={args.onSelect} />,
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open language' }),
    )
    const dialog = within(await body.findByRole('dialog', { name: 'Language' }))
    await userEvent.click(dialog.getByRole('radio', { name: /繁體中文/ }))
    await expect(args.onSelect).toHaveBeenCalledWith('zh-hk')
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull(), {
      timeout: 3000,
    })
  },
}

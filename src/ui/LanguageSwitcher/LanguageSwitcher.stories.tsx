import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { AppLocale } from '@/i18n/locales'

import { Button } from '../Button/Button'
import { LanguageSwitcher } from './LanguageSwitcher'

const meta = {
  title: 'ui/LanguageSwitcher',
  component: LanguageSwitcher,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    locale: 'en' as AppLocale,
    onSelect: () => undefined,
    open: false,
    onOpenChange: () => undefined,
  },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

function ControlledSwitcher({
  initialOpen = false,
}: { initialOpen?: boolean }) {
  const [locale, setLocale] = useState<AppLocale>('en')
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open language
      </Button>
      <LanguageSwitcher
        locale={locale}
        onSelect={setLocale}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

/** Closed until the account-menu entry (or this story control) opens it. */
export const Default: Story = {
  render: () => <ControlledSwitcher />,
}

/** Full-page locale list. */
export const Open: Story = {
  render: () => <ControlledSwitcher initialOpen />,
}

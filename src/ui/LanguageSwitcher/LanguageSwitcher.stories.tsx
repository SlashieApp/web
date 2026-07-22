import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { type ComponentProps, useState } from 'react'

import type { AppLocale } from '@/i18n/locales'

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
  },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

function ControlledSwitcher(
  props: Omit<ComponentProps<typeof LanguageSwitcher>, 'locale' | 'onSelect'>,
) {
  const [locale, setLocale] = useState<AppLocale>('en')
  return <LanguageSwitcher locale={locale} onSelect={setLocale} {...props} />
}

export const Default: Story = {
  render: () => <ControlledSwitcher />,
}

export const Overlay: Story = {
  render: () => <ControlledSwitcher overlay label="Language" />,
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

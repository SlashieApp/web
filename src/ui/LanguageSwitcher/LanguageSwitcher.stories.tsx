import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { phone390 } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { desktop1280 } from '@/app/(stepflow)/stepFlowSpacing.testing'
import type { AppLocale } from '@/i18n/locales'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

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

/**
 * The title block of the list (FE-481 menus): the description is 8 under the
 * title, the first language is 24 under the description, the languages are 8
 * apart, and nothing draws a rule under the header. The close button keeps its
 * 44px target (its margins only take it out of the row's height).
 */
async function expectListSpacing(canvasElement: HTMLElement) {
  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name: 'Language' },
  )
  const title = within(dialog).getByRole('heading', { name: 'Language' })
  const description = within(dialog).getByText(
    'Choose the language used across Slashie.',
  )
  const rows = within(dialog)
    .getAllByRole('radio')
    .map((radio) => radio.closest('label') as HTMLElement)
  await expect(rows).toHaveLength(2)
  await expect(dialog).toHaveAccessibleDescription(
    'Choose the language used across Slashie.',
  )
  await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(description, rows[0] as Element)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(rows[0] as Element, rows[1] as Element)).toBe(
    formSpace.alternativesGap,
  )
  const header = dialog.querySelector('.chakra-dialog__header') as HTMLElement
  await expect(getComputedStyle(header).borderBottomWidth).toBe('0px')
  const close = within(dialog).getByRole('button', { name: 'Close' })
  await expect(heightOf(close)).toBeGreaterThanOrEqual(44)
  // The × is centred on the title's line.
  const mid = (el: Element) =>
    el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2
  await expect(Math.abs(mid(close) - mid(title))).toBeLessThanOrEqual(0.5)
}

/** Desktop: the title block on the spacing steps. */
export const Spacing: Story = {
  ...desktop1280,
  render: (args) => <ControlledSwitcher initialOpen onSelect={args.onSelect} />,
  play: async ({ canvasElement }) => expectListSpacing(canvasElement),
}

/** Phone 390: the same steps. */
export const SpacingPhone: Story = {
  ...phone390,
  render: (args) => <ControlledSwitcher initialOpen onSelect={args.onSelect} />,
  play: async ({ canvasElement }) => expectListSpacing(canvasElement),
}

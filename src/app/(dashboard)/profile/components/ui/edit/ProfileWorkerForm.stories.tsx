import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { ProfileWorkerForm } from './ProfileWorkerForm'

const meta = {
  title: 'Dashboard/Profile/ProfileWorkerForm',
  component: ProfileWorkerForm,
  parameters: { layout: 'padded' },
  decorators: [withSession({ me: storyWorkerMe() })],
} satisfies Meta<typeof ProfileWorkerForm>

export default meta
type Story = StoryObj<typeof meta>

/** A finished worker's details, Save disabled until something changes. */
export const Published: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByLabelText('Legal name')).toHaveValue(
      'Sam Carter',
    )
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeEnabled()
  },
}

/** A required field cleared: Save shows the validation error instead of sending. */
export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(await canvas.findByLabelText('Legal name'))
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(
      await canvas.findByText(/Please enter your legal name/),
    ).toBeVisible()
  },
}

/** zh-HK: the form's own labels and errors are translated. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/profile' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(await canvas.findByLabelText('法定姓名'))
    await userEvent.click(canvas.getByRole('button', { name: '儲存' }))
    await expect(
      await canvas.findByText('請輸入應顯示在工作者個人檔案上的法定姓名。'),
    ).toBeVisible()
  },
}

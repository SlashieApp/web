import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMembership,
  storyWorker,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { WorkerPrimaryCategory } from '@codegen/schema'

import { ProfileWorkerForm } from './ProfileWorkerForm'

const freeWorker: Decorator = withSession({
  me: storyWorkerMe(),
  responses: {
    UpdateWorkerProfile: {
      kind: 'graphqlError',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'TAGLINE_TOO_LONG',
    },
  },
})

const meta = {
  title: 'Dashboard/Profile/ProfileWorkerForm',
  component: ProfileWorkerForm,
  parameters: { layout: 'padded' },
  // A free worker whose every save the API refuses with a plain
  // `TAGLINE_TOO_LONG` (see ServerError), unless a story brings its own
  // session (`parameters.session`): the outer decorator's session would win.
  decorators: [
    (Story, context) =>
      ((context.parameters.session as Decorator | undefined) ?? freeWorker)(
        Story,
        context,
      ),
  ],
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

/** The API refuses a field (a plain `TAGLINE_TOO_LONG`): its copy, not a generic error. */
export const ServerError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByLabelText('Legal name'), ' Jr')
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Keep your headline under 80 characters.',
    )
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

/** The Title field (BE-130): its select, by its label. */
async function titleSelect(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  return (await canvas.findByRole('combobox', {
    name: /Title/,
  })) as HTMLSelectElement
}

/** Free plan: Title is locked, with the Pro badge and a way to Pricing. */
export const TitleLockedOnFree: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = await titleSelect(canvasElement)
    await expect(select).toBeDisabled()
    await expect(select).toHaveValue('')
    await expect(
      canvas.getByText('Pick a title with Slashie Pro.'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'See plans' }),
    ).toHaveAttribute('href', '/pricing')
    // The badge names the plan: Slashie Pro (FE-578).
    await expect(canvas.getByText('Pro')).toBeVisible()
  },
}

/** Slashie Pro ended: the title they picked shows, locked, and why it's hidden. */
export const TitleKeptAfterLapse: Story = {
  parameters: {
    session: withSession({
      me: storyWorkerMe({
        membership: storyMembership('canceled'),
        worker: storyWorker({ titleChoice: WorkerPrimaryCategory.Plumbing }),
      }),
    }),
  },
  play: async ({ canvasElement }) => {
    const select = await titleSelect(canvasElement)
    await expect(select).toBeDisabled()
    await expect(select).toHaveValue('plumbing')
    await expect(
      within(canvasElement).getByText(/Hidden while you're not on Slashie Pro/),
    ).toBeVisible()
  },
}

/** On Slashie Pro: pick a trade's title; Save turns on for it alone. */
export const TitlePickOnUnlimited: Story = {
  parameters: {
    session: withSession({
      me: storyWorkerMe({ membership: storyMembership('active') }),
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const select = await titleSelect(canvasElement)
    await expect(select).toBeEnabled()
    // Worker (no title), then the 12 trades by their noun.
    await expect(select.options).toHaveLength(13)
    await expect(select.options[0]).toHaveTextContent('Worker (no title)')
    await expect(canvas.queryByRole('link', { name: 'See plans' })).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled()
    await userEvent.selectOptions(select, 'Plumber')
    await expect(select).toHaveValue('plumbing')
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled()
  },
}

/**
 * Only the title changed and it doesn't save: its own message. The profile
 * isn't sent (its save is refused in this file, and that error doesn't show).
 */
export const TitleSaveFails: Story = {
  parameters: {
    session: withSession({
      me: storyWorkerMe({ membership: storyMembership('active') }),
      responses: {
        UpdateWorkerProfile: {
          kind: 'graphqlError',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'TAGLINE_TOO_LONG',
        },
        SetWorkerTitle: {
          kind: 'graphqlError',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'PRO_REQUIRED',
        },
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.selectOptions(await titleSelect(canvasElement), 'Carpenter')
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Couldn't save your title. Try again.",
    )
  },
}

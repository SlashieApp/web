import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import { RichTextInput } from './RichTextInput'

function Demo({ value = '' }: { value?: string }) {
  const [text, setText] = useState(value)
  return (
    <RichTextInput
      value={text}
      onChange={setText}
      placeholder="What's the job, and anything a worker should know?"
    />
  )
}

const meta = {
  title: 'UI/RichTextInput',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Empty: bold, italic and a list, with the placeholder in the field. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Bold' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Italic' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Bullet list' }),
    ).toBeVisible()
    await expect(canvas.getByRole('textbox')).toBeVisible()
  },
}

/** A saved description, with bold and a list. */
export const Filled: Story = {
  args: { value: '<p>Fix the <b>tap</b></p><ul><li>Bring a washer</li></ul>' },
}

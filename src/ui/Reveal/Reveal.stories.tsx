import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button'
import { Reveal } from './Reveal'

/** A button that opens a block under it, with a line after it that gets pushed down. */
function Demo({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <Stack gap={0} maxW="360px">
      <Button variant="secondary" onClick={() => setOpen((was) => !was)}>
        {open ? 'Hide the detail' : 'Show the detail'}
      </Button>
      <Reveal open={open} spaceAbove="form.fieldGap" data-testid="reveal">
        <Box p={4} borderRadius="lg" bg="bg.subtle" data-testid="detail">
          <Text fontSize="sm">Only shown once it is asked for.</Text>
        </Box>
      </Reveal>
      <Text fontSize="sm" color="text.muted" mt={5}>
        What follows moves down as it opens.
      </Text>
    </Stack>
  )
}

const meta = {
  title: 'UI/Reveal',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Folded away: nothing is in the page at all, so nothing can be tabbed to. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId('reveal')).toBeNull()
  },
}

/**
 * Opening slides the content in under the button, with its space above
 * inside the fold; closing folds it away and takes it out of the page.
 */
export const OpensAndCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show the detail' }),
    )
    const reveal = await canvas.findByTestId('reveal')
    await waitFor(() => expect(reveal).toHaveAttribute('data-reveal', 'open'))
    await waitFor(() => expect(getComputedStyle(reveal).opacity).toBe('1'))
    const detail = canvas.getByTestId('detail')
    await expect(detail).toBeVisible()
    // The space above (20) is part of what opened.
    await waitFor(() =>
      expect(Math.round(reveal.getBoundingClientRect().height)).toBe(
        Math.round(detail.getBoundingClientRect().height) + 20,
      ),
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Hide the detail' }),
    )
    await expect(reveal).toHaveAttribute('inert')
    await waitFor(() => expect(canvas.queryByTestId('reveal')).toBeNull())
  },
}

/**
 * The fold itself has no padding and no minimum height, so it starts from
 * nothing: the space above sits on the content inside it. (With the space on
 * the fold, it opened 20 tall and jumped.)
 */
export const FoldsToNothing: Story = {
  args: { startOpen: true },
  play: async ({ canvasElement }) => {
    const reveal = within(canvasElement).getByTestId('reveal')
    const fold = reveal.firstElementChild as HTMLElement
    const style = getComputedStyle(fold)
    await expect(style.paddingTop).toBe('0px')
    await expect(style.paddingBottom).toBe('0px')
    await expect(style.minHeight).toBe('0px')
    await expect(
      getComputedStyle(fold.firstElementChild as HTMLElement).paddingTop,
    ).toBe('20px')
  },
}

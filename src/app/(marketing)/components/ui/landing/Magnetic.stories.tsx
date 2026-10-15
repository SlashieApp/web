import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'

import { Button } from '@ui'

import { Magnetic } from './Magnetic'

/** Story-only: the wrapper element around the child, and the child itself. */
function getMagnet(canvasElement: HTMLElement) {
  const button = within(canvasElement).getByRole('button', {
    name: 'Post a task',
  })
  const wrapper = button.parentElement as HTMLElement
  return { button, wrapper }
}

/** Story-only: a pointer move over the right edge of the wrapper. */
function moveOverRightEdge(
  wrapper: HTMLElement,
  pointerType: 'mouse' | 'touch',
) {
  const rect = wrapper.getBoundingClientRect()
  fireEvent.pointerMove(wrapper, {
    pointerType,
    clientX: rect.right - 2,
    clientY: rect.top + rect.height / 2,
  })
}

/** Story-only: waits for two frames, the time motion needs to apply a pull. */
function nextFrames() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

const meta = {
  title: 'Marketing/Landing/Magnetic',
  component: Magnetic,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    children: (
      <Button variant="primary" size="lg">
        Post a task
      </Button>
    ),
  },
} satisfies Meta<typeof Magnetic>

export default meta
type Story = StoryObj<typeof meta>

/** At rest: the CTA sits in place until a mouse pointer moves over it. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const { wrapper } = getMagnet(canvasElement)
    await nextFrames()
    await expect(wrapper.style.transform).toBe('none')
  },
}

/** Mouse over the right edge: the CTA eases a few px toward the pointer (7px at most). */
export const PulledByMouse: Story = {
  play: async ({ canvasElement }) => {
    const { wrapper } = getMagnet(canvasElement)
    moveOverRightEdge(wrapper, 'mouse')
    // Reduced motion keeps the CTA still, so only expect a pull without it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    await waitFor(() => expect(wrapper.style.transform).not.toBe('none'), {
      timeout: 3000,
    })
  },
}

/** Touch pointer: inert, the CTA never moves (no hover to follow on touch). */
export const TouchIgnored: Story = {
  play: async ({ canvasElement }) => {
    const { wrapper } = getMagnet(canvasElement)
    moveOverRightEdge(wrapper, 'touch')
    await nextFrames()
    await expect(wrapper.style.transform).toBe('none')
  },
}

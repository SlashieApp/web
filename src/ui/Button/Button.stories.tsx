import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuPlus } from 'react-icons/lu'
import { expect, waitFor, within } from 'storybook/test'

import { Button, type UiButtonVariant } from './Button'

const SDL_VARIANTS: UiButtonVariant[] = [
  'primary',
  'secondary',
  'ghost',
  'danger',
  'premium',
]

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: SDL_VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'form'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { variant: 'primary', size: 'md', children: 'Post a task' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/** Playground: drive variant, size, loading and disabled from Controls. */
export const Playground: Story = {}

/** Primary: the one main action in a region (green fill, dark ink). */
export const Primary: Story = {
  args: { variant: 'primary', children: 'Post a task' },
}

/** Secondary: supporting action on a bordered surface. */
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Save draft' },
}

/** Ghost: low-emphasis action with no fill or border until hover. */
export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Dismiss' },
}

/** Danger: destructive action such as cancelling a task. */
export const Danger: Story = {
  args: { variant: 'danger', children: 'Cancel task' },
}

/** Premium: paid upgrade prompt (plum fill, white ink). */
export const Premium: Story = {
  args: { variant: 'premium', children: 'Go Unlimited' },
}

/** Small (`sm`): 36px tall, for dense rows and desktop toolbars. */
export const Small: Story = { args: { size: 'sm' } }

/** Medium (`md`, the default): 44px tall, meets the touch target. */
export const Medium: Story = { args: { size: 'md' } }

/** Large (`lg`): 52px tall, for the main call to action on a page. */
export const Large: Story = { args: { size: 'lg' } }

/**
 * Form (`form`): 48px tall, the height of a field. The main button of a form,
 * and Google and Apple under it, use it; `lg` stays for marketing CTAs.
 */
export const Form: Story = {
  args: { size: 'form', children: 'Log in' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Log in' })
    await expect(Math.round(button.getBoundingClientRect().height)).toBe(48)
  },
}

/** Every variant at the default size. */
export const AllVariants: Story = {
  render: () => (
    <HStack gap={3} flexWrap="wrap" alignItems="center">
      <Button variant="primary">Post a task</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="danger">Cancel task</Button>
      <Button variant="premium">Go Unlimited</Button>
    </HStack>
  ),
}

/** Sizes sm / md / lg / form (md, lg and form meet the 44px touch target). */
export const Sizes: Story = {
  render: () => (
    <HStack gap={3} alignItems="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="form">Form</Button>
    </HStack>
  ),
}

/** Shape: every size and variant is a pill with a 500 label. */
export const Shape: Story = {
  render: () => (
    <Stack gap={3}>
      {(['sm', 'md', 'lg', 'form'] as const).map((size) => (
        <HStack key={size} gap={3} flexWrap="wrap" alignItems="center">
          {SDL_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {`${variant} ${size}`}
            </Button>
          ))}
        </HStack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      const style = getComputedStyle(button)
      await expect(style.borderTopLeftRadius).toBe('9999px')
      await expect(style.fontWeight).toBe('500')
    }
  },
}

/** Secondary hover, forced with `data-hover`: the hairline steps from `border.strong` to `border.hover`. */
export const SecondaryHover: Story = {
  render: () => (
    <HStack gap={3}>
      <Button variant="secondary">Rest</Button>
      <Button variant="secondary" data-hover>
        Hover
      </Button>
    </HStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      getComputedStyle(canvas.getByText('Rest')).borderTopColor,
    ).toBe('rgb(212, 212, 216)')
    await waitFor(() =>
      expect(getComputedStyle(canvas.getByText('Hover')).borderTopColor).toBe(
        'rgb(161, 161, 170)',
      ),
    )
  },
}

/** States across the primary variant. Tab to a button to see the focus ring. */
export const States: Story = {
  render: () => (
    <Stack gap={4}>
      {SDL_VARIANTS.map((variant) => (
        <HStack key={variant} gap={3} flexWrap="wrap" alignItems="center">
          <Button variant={variant}>Default</Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Loading
          </Button>
        </HStack>
      ))}
    </Stack>
  ),
}

/** Loading: spinner replaces the label and the button stops taking clicks. */
export const Loading: Story = { args: { loading: true } }

/** Loading premium: the plum stays (a loading button is not a disabled one), as primary keeps its green. */
export const PremiumLoading: Story = {
  args: { variant: 'premium', loading: true, children: 'Start free trial' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await expect(getComputedStyle(button).backgroundColor).toBe(
      'rgb(105, 56, 239)',
    )
    await expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)')
  },
}

/** Disabled: muted fill and text, not focusable and not clickable. */
export const Disabled: Story = { args: { disabled: true } }

/** Disabled secondary: surface fill with muted text, no border or shadow. */
export const DisabledSecondary: Story = {
  args: { variant: 'secondary', disabled: true, children: 'Save draft' },
}

/** Disabled ghost: muted text on a transparent fill. */
export const DisabledGhost: Story = {
  args: { variant: 'ghost', disabled: true, children: 'Dismiss' },
}

/** Loading with text: the spinner sits beside a loading label. */
export const LoadingWithText: Story = {
  args: { loading: true, loadingText: 'Posting...', children: 'Post a task' },
}

/** With icon: a leading icon sits before the label. */
export const WithLeadingIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <LuPlus aria-hidden />
      Post a task
    </Button>
  ),
}

/** Full width: stretches to its container, as in sheet footers. */
export const FullWidth: Story = { args: { w: 'full' } }

/** As a link: `asChild` puts the button styling on an anchor. */
export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="/tasks/create">Post a task</a>
    </Button>
  ),
}

/** Long label: the button stays on one line and grows with its text. */
export const LongLabel: Story = {
  args: { children: 'Send my quote and message to the customer' },
}

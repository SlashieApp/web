import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NEVER } from 'rxjs'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { FeedbackDialogProvider } from '../FeedbackDialog/FeedbackDialogProvider'
import { Footer, type UiFooterVariant } from './Footer'

const SDL_VARIANTS: UiFooterVariant[] = ['default', 'minimal']

/** Story-only Apollo client: the language switcher's mutation never reaches the live API. */
const neverClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

const meta = {
  title: 'Shell/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'inline-radio', options: SDL_VARIANTS },
    tagline: { control: 'text' },
    copyright: { control: 'text' },
  },
  args: { variant: 'default' },
  decorators: [
    (Story) => (
      <ApolloProvider client={neverClient}>
        <FeedbackDialogProvider onSubmit={async () => true}>
          <Story />
        </FeedbackDialogProvider>
      </ApolloProvider>
    ),
  ],
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

/** Playground: change the variant, tagline and copyright from the Controls panel. */
export const Playground: Story = {}

/** Full footer: brand block, primary nav, and legal row. */
export const Default: Story = {
  args: { variant: 'default' },
  play: async ({ canvasElement }) => {
    // The language button is a pill with a 1px border.strong outline, like
    // every secondary button.
    const style = getComputedStyle(
      within(canvasElement).getByRole('button', { name: /^Language:/ }),
    )
    await expect(style.borderTopLeftRadius).toBe('9999px')
    await expect(style.borderTopWidth).toBe('1px')
    await expect(style.borderTopColor).toBe('rgb(212, 212, 216)')
  },
}

/** Compact single-row footer (meta + legal only). */
export const Minimal: Story = { args: { variant: 'minimal' } }

/** Both variants stacked. Renders under light and dark via the theme toolbar. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={8}>
      {SDL_VARIANTS.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text
            px={6}
            fontSize="xs"
            color="text.subtle"
            textTransform="uppercase"
          >
            {variant}
          </Text>
          <Footer variant={variant} />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Custom tagline + copyright via the public props. */
export const CustomContent: Story = {
  args: {
    variant: 'default',
    tagline: 'Find local help, hire with confidence.',
    copyright: '© Slashie 2026. All rights reserved',
  },
}

/** Focus: the first Tab stop (the language button) shows the focus ring. */
export const Focus: Story = {
  args: { variant: 'default' },
  parameters: {
    pseudo: { focusVisible: true },
  },
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(
      within(canvasElement).getByRole('button', { name: /^Language:/ }),
    ).toHaveFocus()
  },
}

/** Phone: the link columns collapse into closed accordions under the brand block. */
export const Mobile: Story = {
  args: { variant: 'default' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Phone, expanded: tapping a group (Product) opens its links. */
export const MobileAccordionOpen: Story = {
  args: { variant: 'default' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const product = canvas.getByRole('button', { name: 'Product' })
    await userEvent.click(product)
    await waitFor(
      () => expect(product).toHaveAttribute('aria-expanded', 'true'),
      { timeout: 3000 },
    )
    await waitFor(
      () =>
        expect(
          canvas.getByRole('link', { name: 'Search tasks' }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Phone, minimal: copyright, legal links and the language button stack in one column. */
export const MinimalMobile: Story = {
  args: { variant: 'minimal' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Language: the language button opens the full-page locale list. */
export const LanguageListOpen: Story = {
  args: { variant: 'default' },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Language: English' }),
    )
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Language',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Feedback: the Support column link opens the feedback dialog. */
export const FeedbackDialogOpen: Story = {
  args: { variant: 'default' },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Feedback' }),
    )
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Send feedback',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

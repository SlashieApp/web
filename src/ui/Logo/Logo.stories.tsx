import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ColorModeProvider } from '../color-mode'
import { Logo } from './Logo'

const meta = {
  title: 'ui/Logo',
  component: Logo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => (
      <ColorModeProvider forcedTheme={context.globals.theme}>
        <Story />
      </ColorModeProvider>
    ),
  ],
  args: {},
} satisfies Meta<typeof Logo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

type ThemeMode = 'light' | 'dark'

function TypographyStory(_props: { themeMode: ThemeMode }) {
  return (
    <Stack gap={6} maxW="640px">
      <Text
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="0.18em"
        color="text.muted"
        fontWeight={700}
      >
        Typography
      </Text>

      <Stack gap={2}>
        <Text color="text.muted" fontSize="2xl">
          Headline / Display
        </Text>
        <Heading size="4xl" color="text.default">
          Plus Jakarta Sans
        </Heading>
      </Stack>

      <Stack gap={2}>
        <Text color="text.muted" fontSize="2xl">
          Body / UI Label
        </Text>
        <Text
          fontFamily="body"
          fontSize={{ base: '3xl', md: '4xl' }}
          color="text.default"
        >
          Inter Font Family
        </Text>
      </Stack>

      <Box h="1px" bg="border.default" />

      <Text
        color="text.link"
        fontSize={{ base: '5xl', md: '6xl' }}
        fontStyle="italic"
        fontFamily="heading"
        lineHeight="1.08"
      >
        &quot;Clarity over decoration&quot;
      </Text>
    </Stack>
  )
}

const meta = {
  title: 'design/Typography',
  component: TypographyStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    themeMode: 'light' as ThemeMode,
  },
} satisfies Meta<typeof TypographyStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    themeMode: 'light',
  },
  render: (_args, context) => (
    <TypographyStory
      themeMode={(context.globals.theme as ThemeMode) ?? 'light'}
    />
  ),
}

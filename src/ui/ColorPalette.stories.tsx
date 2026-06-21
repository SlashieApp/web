import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  BRAND_PRIMARY,
  BRAND_PRIMARY_HOVER,
  BRAND_SECONDARY,
} from '@/theme/system'

type ThemeMode = 'light' | 'dark'

type PaletteSwatch = {
  label: string
  hex: string
  glow?: boolean
  outlined?: boolean
}

const BRAND_PALETTE: PaletteSwatch[] = [
  {
    label: 'Primary',
    hex: `linear-gradient(to top right, ${BRAND_PRIMARY} 0%, ${BRAND_PRIMARY_HOVER} 100%)`,
    glow: true,
  },
  { label: 'Primary default', hex: BRAND_PRIMARY },
  { label: 'Primary hover', hex: BRAND_PRIMARY_HOVER },
  { label: 'Brand Base', hex: '#222222', outlined: true },
  { label: 'Secondary', hex: BRAND_SECONDARY },
  { label: 'Tertiary Accent', hex: '#54BBBB' },
]

function ColorPaletteStory({ themeMode }: { themeMode: ThemeMode }) {
  const isDark = themeMode === 'dark'
  const nameColor = isDark ? 'white' : 'ink.900'
  const hexColor = isDark ? 'whiteAlpha.700' : 'secondary.600'
  const sectionLabel = isDark ? 'whiteAlpha.500' : 'secondary.700'

  return (
    <Stack gap={8} maxW="900px" w="full">
      <Text
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="0.2em"
        color={sectionLabel}
        fontWeight={700}
      >
        Color palette
      </Text>

      <HStack
        align="flex-start"
        gap={{ base: 4, md: 6 }}
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
        justify="space-between"
      >
        {BRAND_PALETTE.map((item) => (
          <Stack
            key={item.label}
            gap={3}
            flex="1"
            minW={{ base: '40%', md: '0' }}
          >
            <Box
              h={{ base: '88px', md: '104px' }}
              w="full"
              borderRadius="lg"
              bg={item.hex}
              borderWidth={item.outlined ? '1px' : '0'}
              borderColor={
                item.outlined
                  ? isDark
                    ? 'whiteAlpha.300'
                    : 'neutral.400'
                  : undefined
              }
              boxShadow={item.glow ? 'primary' : undefined}
            />
            <Stack gap={0.5}>
              <Text
                fontWeight={800}
                color={nameColor}
                fontSize="sm"
                lineHeight="short"
              >
                {item.label}
              </Text>
              <Text fontSize="xs" color={hexColor} fontFamily="mono">
                {item.hex}
              </Text>
            </Stack>
          </Stack>
        ))}
      </HStack>
    </Stack>
  )
}

const meta = {
  title: 'design/ColorPalette',
  component: ColorPaletteStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    themeMode: 'light' as ThemeMode,
  },
} satisfies Meta<typeof ColorPaletteStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    themeMode: 'light',
  },
  render: (_args, context) => (
    <ColorPaletteStory
      themeMode={(context.globals.theme as ThemeMode) ?? 'light'}
    />
  ),
}

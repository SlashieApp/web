'use client'

import { Box, ChakraProvider, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { darkSystem, lightSystem } from '@/theme/chakraSystem'
import { sdlMotion } from '@/theme/styles'

/**
 * Foundations/Color live swatches.
 *
 * SINGLE SOURCE OF TRUTH: the hex/role tables below mirror
 * `src/theme/chakraSystem.ts`. Primitive swatches render the raw hex so the
 * docs cannot silently disagree with the primitive scale; semantic swatches
 * resolve the live CSS variable (`var(--chakra-colors-...)`) so the value shown
 * is exactly what the active themed system emits. Each mode is rendered inside
 * its own `ChakraProvider` (light/dark systems imported from the theme module),
 * so both modes are shown together and stay in lockstep with code.
 */

// ── Primitive scales (mirror tokens.colors in chakraSystem.ts) ──────────────
type Swatch = { name: string; hex: string; role?: string }

export const greenScale: Swatch[] = [
  { name: 'green.50', hex: '#E7FBF0', role: 'success.soft (light)' },
  { name: 'green.100', hex: '#C6F6DD' },
  { name: 'green.200', hex: '#92ECC0', role: 'intent border tint' },
  { name: 'green.300', hex: '#54DD9D', role: 'text.link / fg (dark)' },
  { name: 'green.400', hex: '#00DC82', role: 'action.primary' },
  { name: 'green.500', hex: '#00C275', role: 'action.primaryHover' },
  {
    name: 'green.600',
    hex: '#02A567',
    role: 'action.primaryPressed / border.focus',
  },
  { name: 'green.700', hex: '#048654', role: 'text.link (light) / success.fg' },
  { name: 'green.800', hex: '#05683F' },
  { name: 'green.900', hex: '#053D27' },
]

export const neutralScale: Swatch[] = [
  { name: 'neutral.0', hex: '#FFFFFF', role: 'bg.surface (light)' },
  { name: 'neutral.50', hex: '#F7F9F8', role: 'bg.canvas (light)' },
  { name: 'neutral.100', hex: '#EEF1F0', role: 'bg.subtle (light)' },
  { name: 'neutral.200', hex: '#E0E5E3', role: 'border.default (light)' },
  { name: 'neutral.300', hex: '#C7CECB', role: 'border.strong (light)' },
  { name: 'neutral.400', hex: '#9BA4A0', role: 'text.subtle (light)' },
  { name: 'neutral.500', hex: '#6E7873' },
  { name: 'neutral.600', hex: '#515A56', role: 'text.muted (light)' },
  { name: 'neutral.700', hex: '#3A423E' },
  { name: 'neutral.800', hex: '#232A27' },
  {
    name: 'neutral.900',
    hex: '#0A1512',
    role: 'text.default / onGreen (light)',
  },
]

export const plumScale: Swatch[] = [
  { name: 'plum.50', hex: '#F4F1FE' },
  { name: 'plum.100', hex: '#E6DEFD' },
  { name: 'plum.400', hex: '#7A5AF8', role: 'accent.premium (dark)' },
  { name: 'plum.500', hex: '#6938EF', role: 'accent.premium (light)' },
  { name: 'plum.600', hex: '#5925DC' },
  { name: 'plum.700', hex: '#4A1FB8' },
]

export const statusScale: Swatch[] = [
  { name: 'warning.soft', hex: '#FEF6E7' },
  { name: 'warning.fg', hex: '#8A5A00' },
  { name: 'warning.solid', hex: '#F5A300' },
  { name: 'danger.soft', hex: '#FEF1F1' },
  { name: 'danger.fg', hex: '#B42318' },
  { name: 'danger.solid', hex: '#F04438' },
  { name: 'info.soft', hex: '#EFF6FF' },
  { name: 'info.fg', hex: '#175CD3' },
  { name: 'info.solid', hex: '#2E90FA' },
]

// ── Semantic roles (mirror semanticTokens.colors; value = live CSS var) ─────
type SemanticRole = { role: string; token: string; note?: string }

export const semanticBg: SemanticRole[] = [
  {
    role: 'bg.canvas',
    token: '--chakra-colors-bg-canvas',
    note: 'app background',
  },
  {
    role: 'bg.surface',
    token: '--chakra-colors-bg-surface',
    note: 'cards / sheets',
  },
  {
    role: 'bg.subtle',
    token: '--chakra-colors-bg-subtle',
    note: 'hover / wells',
  },
  {
    role: 'bg.raised',
    token: '--chakra-colors-bg-raised',
    note: 'popovers / menus',
  },
]

export const semanticText: SemanticRole[] = [
  { role: 'text.default', token: '--chakra-colors-text-default' },
  { role: 'text.muted', token: '--chakra-colors-text-muted' },
  { role: 'text.subtle', token: '--chakra-colors-text-subtle' },
  {
    role: 'text.onGreen',
    token: '--chakra-colors-text-onGreen',
    note: 'ink on green fills',
  },
  { role: 'text.link', token: '--chakra-colors-text-link' },
]

export const semanticBorder: SemanticRole[] = [
  { role: 'border.default', token: '--chakra-colors-border-default' },
  { role: 'border.strong', token: '--chakra-colors-border-strong' },
  { role: 'border.focus', token: '--chakra-colors-border-focus' },
]

export const semanticAction: SemanticRole[] = [
  { role: 'action.primary', token: '--chakra-colors-action-primary' },
  { role: 'action.primaryHover', token: '--chakra-colors-action-primaryHover' },
  {
    role: 'action.primaryPressed',
    token: '--chakra-colors-action-primaryPressed',
  },
  { role: 'accent.premium', token: '--chakra-colors-accent-premium' },
]

export const statusFamilies = ['success', 'warning', 'danger', 'info'] as const

// ── Atoms ───────────────────────────────────────────────────────────────────

/** A primitive swatch: renders the raw hex (mirrors the scale in code). */
function PrimitiveSwatch({ name, hex, role }: Swatch) {
  return (
    <Stack gap={1.5}>
      <Box
        h="56px"
        w="full"
        borderRadius="lg"
        bg={hex}
        borderWidth="1px"
        borderColor="border.default"
        transition={`transform ${sdlMotion.duration.fast} ${sdlMotion.easing.standard}`}
        _hover={{ transform: 'translateY(-2px)' }}
      />
      <Stack gap={0}>
        <Text fontSize="xs" fontWeight={600} color="text.default">
          {name}
        </Text>
        <Text fontSize="xs" fontFamily="mono" color="text.muted">
          {hex}
        </Text>
        {role ? (
          <Text fontSize="11px" color="text.subtle">
            {role}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}

/** A semantic-role swatch: fill resolves the live CSS var for the active mode. */
function SemanticSwatch({ role, token, note }: SemanticRole) {
  return (
    <Stack gap={1.5}>
      <Box
        h="56px"
        w="full"
        borderRadius="lg"
        bg={`var(${token})`}
        borderWidth="1px"
        borderColor="border.default"
        transition={`transform ${sdlMotion.duration.fast} ${sdlMotion.easing.standard}`}
        _hover={{ transform: 'translateY(-2px)' }}
      />
      <Stack gap={0}>
        <Text fontSize="xs" fontWeight={600} color="text.default">
          {role}
        </Text>
        <Text fontSize="11px" fontFamily="mono" color="text.muted">
          {token}
        </Text>
        {note ? (
          <Text fontSize="11px" color="text.subtle">
            {note}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="0.12em"
      color="text.muted"
    >
      {children}
    </Text>
  )
}

/** All swatch sections, themed by whichever system wraps this tree. */
function ColorContents() {
  return (
    <Stack gap={8} w="full">
      <Stack gap={3}>
        <SectionLabel>Green primitives</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={4}>
          {greenScale.map((s) => (
            <PrimitiveSwatch key={s.name} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Neutral primitives</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={4}>
          {neutralScale.map((s) => (
            <PrimitiveSwatch key={s.name} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Plum primitives (premium accent)</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={4}>
          {plumScale.map((s) => (
            <PrimitiveSwatch key={s.name} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Status primitives</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 3 }} gap={4}>
          {statusScale.map((s) => (
            <PrimitiveSwatch key={s.name} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Semantic — backgrounds</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 4 }} gap={4}>
          {semanticBg.map((s) => (
            <SemanticSwatch key={s.role} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Semantic — text</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 5 }} gap={4}>
          {semanticText.map((s) => (
            <SemanticSwatch key={s.role} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Semantic — border</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 3 }} gap={4}>
          {semanticBorder.map((s) => (
            <SemanticSwatch key={s.role} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Semantic — action &amp; accent</SectionLabel>
        <SimpleGrid columns={{ base: 2, sm: 4 }} gap={4}>
          {semanticAction.map((s) => (
            <SemanticSwatch key={s.role} {...s} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>
          Semantic — status families (soft / fg / solid)
        </SectionLabel>
        <Stack gap={4}>
          {statusFamilies.map((family) => (
            <Stack key={family} gap={2}>
              <Text fontSize="xs" fontWeight={600} color="text.default">
                status.{family}
              </Text>
              <SimpleGrid columns={3} gap={4}>
                <SemanticSwatch
                  role={`status.${family}.soft`}
                  token={`--chakra-colors-status-${family}-soft`}
                />
                <SemanticSwatch
                  role={`status.${family}.fg`}
                  token={`--chakra-colors-status-${family}-fg`}
                />
                <SemanticSwatch
                  role={`status.${family}.solid`}
                  token={`--chakra-colors-status-${family}-solid`}
                />
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

/** One themed mode panel (its own ChakraProvider so light + dark show together). */
function ModePanel({
  mode,
  children,
}: {
  mode: 'light' | 'dark'
  children: ReactNode
}) {
  const system = mode === 'light' ? lightSystem : darkSystem
  return (
    <ChakraProvider value={system}>
      <Box
        className={mode}
        bg="bg.canvas"
        color="text.default"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="xl"
        p={5}
      >
        <Text
          fontSize="xs"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing="0.12em"
          color="text.muted"
          mb={4}
        >
          {mode} mode
        </Text>
        {children}
      </Box>
    </ChakraProvider>
  )
}

/** Shows both modes side-by-side (or stacked on small screens). */
export function ColorPalettes() {
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={5} alignItems="start">
      <ModePanel mode="light">
        <ColorContents />
      </ModePanel>
      <ModePanel mode="dark">
        <ColorContents />
      </ModePanel>
    </SimpleGrid>
  )
}

/** Green-ink rule demo — green/danger fills always pair with text.onGreen (ink). */
export function GreenInkDemo() {
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={5}>
      {(['light', 'dark'] as const).map((mode) => {
        const system = mode === 'light' ? lightSystem : darkSystem
        return (
          <ChakraProvider key={mode} value={system}>
            <Box
              className={mode}
              bg="bg.canvas"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="xl"
              p={5}
            >
              <Text
                fontSize="xs"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing="0.12em"
                color="text.muted"
                mb={4}
              >
                {mode} mode
              </Text>
              <Stack gap={3}>
                <Box
                  bg="action.primary"
                  color="text.onGreen"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontWeight={600}
                  fontSize="sm"
                >
                  action.primary + text.onGreen (ink, never white)
                </Box>
                <Box
                  bg="status.danger.solid"
                  color="text.onGreen"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontWeight={600}
                  fontSize="sm"
                >
                  status.danger.solid + text.onGreen
                </Box>
              </Stack>
            </Box>
          </ChakraProvider>
        )
      })}
    </SimpleGrid>
  )
}

/**
 * Reusable **card / elevated surface** semantic colors (not task-specific).
 * Feeds `card*` tokens in `system.ts` so list cards, dashboards, and auth
 * screens share one palette.
 */
import {
  darkIntentPrimaryIcon,
  lightIntentPalette,
  lightIntentPrimaryIcon,
} from './intentPalette'

type SemanticColorEntry = { value: { base: string } }

export type CardSurfacePalette = {
  cardBg: string
  cardBorder: string
  cardFg: string
  cardMutedFg: string
  cardDivider: string
  cardIconPodBg: string
  cardIconPodFg: string
  cardAccentFg: string
  cardAvatarEmpty: string
  cardAvatarMore: string
  cardStrongFg: string
}

export const lightCardSurface: CardSurfacePalette = {
  cardBg: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  cardFg: '#151a18',
  cardMutedFg: '#1f2623',
  cardDivider: '#e4e7e5',
  cardIconPodBg: lightIntentPalette.primary.bg,
  cardIconPodFg: lightIntentPrimaryIcon,
  cardAccentFg: '#00A572',
  cardAvatarEmpty: '#eff1f0',
  cardAvatarMore: '#e4e7e5',
  cardStrongFg: '#1f2623',
}

/** Dark icon pod uses a solid emerald well (legible on charcoal cards). */
export const darkCardIconPodBg = '#14532d'

export const darkCardSurface: CardSurfacePalette = {
  cardBg: '#2a2a2a',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  cardFg: '#ffffff',
  cardMutedFg: 'rgba(255, 255, 255, 0.62)',
  cardDivider: 'rgba(255, 255, 255, 0.12)',
  cardIconPodBg: darkCardIconPodBg,
  cardIconPodFg: darkIntentPrimaryIcon,
  cardAccentFg: '#00DC82',
  cardAvatarEmpty: 'rgba(255, 255, 255, 0.14)',
  cardAvatarMore: 'rgba(255, 255, 255, 0.1)',
  cardStrongFg: 'rgba(255, 255, 255, 0.88)',
}

export function cardSemanticColors(
  palette: CardSurfacePalette,
): Record<string, SemanticColorEntry> {
  const out: Record<string, SemanticColorEntry> = {}
  for (const [key, value] of Object.entries(palette)) {
    out[key] = { value: { base: value } }
  }
  return out
}

import { describe, expect, it } from 'vitest'

import { sdlTextSubtleLight } from './styles'

/** WCAG relative luminance for sRGB hex (`#rrggbb`). */
function luminance(hex: string): number {
  const raw = hex.replace('#', '')
  const channels = [0, 2, 4].map((i) => {
    const value = Number.parseInt(raw.slice(i, i + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function blendWhite(alpha: number, backgroundHex: string): string {
  const raw = backgroundHex.replace('#', '')
  const bg = [0, 2, 4].map((i) => Number.parseInt(raw.slice(i, i + 2), 16))
  const mixed = bg.map((channel) =>
    Math.round(255 * alpha + channel * (1 - alpha)),
  )
  return `#${mixed.map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Contrast contract for muted / support copy (FE-145). Hexes must stay in
 * lockstep with `lightSemanticColors` in `./chakraSystem.ts`.
 */
describe('SDL text contrast (WCAG AA)', () => {
  const canvas = '#F7F9F8'
  const surface = '#FFFFFF'
  const subtleFill = '#EEF1F0'
  const inverted = '#0C1310'
  const brandHero = '#05683F'
  const muted = '#515A56'
  const onInvertedMuted = '#A6AFAB'

  it('text.subtle passes AA on light canvas, surface, and subtle fills', () => {
    expect(contrastRatio(sdlTextSubtleLight, canvas)).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(contrastRatio(sdlTextSubtleLight, surface)).toBeGreaterThanOrEqual(
      4.5,
    )
    expect(
      contrastRatio(sdlTextSubtleLight, subtleFill),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('text.muted stays stronger than text.subtle on canvas', () => {
    expect(contrastRatio(muted, canvas)).toBeGreaterThan(
      contrastRatio(sdlTextSubtleLight, canvas),
    )
    expect(contrastRatio(muted, canvas)).toBeGreaterThanOrEqual(4.5)
  })

  it('hero support copy on inverted and brand surfaces passes AA', () => {
    expect(contrastRatio(onInvertedMuted, inverted)).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(blendWhite(0.85, brandHero), brandHero),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(blendWhite(0.88, brandHero), brandHero),
    ).toBeGreaterThanOrEqual(4.5)
  })
})

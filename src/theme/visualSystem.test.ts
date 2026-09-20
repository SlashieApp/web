import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { sdlCard, sdlCardSurface, sdlTextAa } from './styles'

function srgbChannel(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const raw = hex.replace('#', '')
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return (
    0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
  )
}

function contrastRatio(a: string, b: string): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b))
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

function blendOn(fgHex: string, bgHex: string, alpha: number): string {
  const fg = fgHex.replace('#', '')
  const bg = bgHex.replace('#', '')
  const mix = (i: number) =>
    Math.round(
      alpha * Number.parseInt(fg.slice(i, i + 2), 16) +
        (1 - alpha) * Number.parseInt(bg.slice(i, i + 2), 16),
    )
  return `#${[0, 2, 4].map((i) => mix(i).toString(16).padStart(2, '0')).join('')}`
}

function parseRgbaAlpha(value: string): number {
  const match = value.match(
    /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)/,
  )
  if (!match) throw new Error(`Expected white rgba(), got ${value}`)
  return Number(match[1])
}

describe('sdlCard recipe', () => {
  it('uses one radius and the e1/e2/e3 elevation steps', () => {
    expect(sdlCard.radius).toBe('lg')
    expect(sdlCard.shadow).toBe('e1')
    expect(sdlCard.raisedShadow).toBe('e2')
    expect(sdlCard.overlayShadow).toBe('e3')
    expect(sdlCardSurface.borderRadius).toBe('lg')
    expect(sdlCardSurface.boxShadow).toBe('e1')
  })

  it('is the Card primitive default surface', () => {
    const card = readFileSync(
      join(process.cwd(), 'src/ui/Card/Card.tsx'),
      'utf8',
    )
    expect(card).toContain('sdlCardSurface')
    expect(card).toContain('sdlCard.radius')
  })
})

describe('WCAG AA support copy', () => {
  it('meets 4.5:1 on light canvas, inverted hero, and brand hero', () => {
    expect(
      contrastRatio(sdlTextAa.lightSubtle, '#F7F9F8'),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(sdlTextAa.lightSubtle, '#FFFFFF'),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(sdlTextAa.invertedMuted, '#0C1310'),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(
        blendOn('#FFFFFF', '#05683F', parseRgbaAlpha(sdlTextAa.onBrandMuted)),
        '#05683F',
      ),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      contrastRatio(
        blendOn('#FFFFFF', '#05683F', parseRgbaAlpha(sdlTextAa.onBrandSubtle)),
        '#05683F',
      ),
    ).toBeGreaterThanOrEqual(4.5)
  })

  it('is wired into both Chakra semantic systems', () => {
    const theme = readFileSync(
      join(process.cwd(), 'src/theme/chakraSystem.ts'),
      'utf8',
    )
    expect(theme).toContain('sdlTextAa.lightSubtle')
    expect(theme).toContain('sdlTextAa.invertedMuted')
    expect(theme).toContain('sdlTextAa.onBrandMuted')
    expect(theme).toContain('sdlTextAa.onBrandSubtle')
  })
})

describe('elevation aliases in feature chrome', () => {
  it('does not use the leftover ghostBorder shadow', () => {
    const filters = readFileSync(
      join(
        process.cwd(),
        'src/app/(task)/components/(web)/layout/TaskBrowseFilters.tsx',
      ),
      'utf8',
    )
    const picker = readFileSync(
      join(
        process.cwd(),
        'src/app/(stepflow)/tasks/create/components/layout/map/TaskLocationMapPicker.tsx',
      ),
      'utf8',
    )
    expect(filters).not.toContain('ghostBorder')
    expect(picker).not.toContain('ghostBorder')
    expect(filters).toContain('e3')
    expect(picker).toContain('e1')
  })

  it('map pin popups and hero search use the card radius / elevation tokens', () => {
    const pin = readFileSync(
      join(process.cwd(), 'src/app/(task)/helpers/taskMap/pin/styles.ts'),
      'utf8',
    )
    const heroSearch = readFileSync(
      join(
        process.cwd(),
        'src/app/(marketing)/components/ui/landing/hero/HeroSearchCta.tsx',
      ),
      'utf8',
    )
    expect(pin).toContain('sdlRadii.lg')
    expect(pin).toContain('sdlElevation.e1')
    expect(pin).toContain('sdlElevation.e2')
    expect(pin).not.toContain('0 4px 16px')
    expect(heroSearch).toContain('borderRadius={sdlCard.radius}')
    expect(heroSearch).not.toContain('rgba(0, 220, 130')
  })
})

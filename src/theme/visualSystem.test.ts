import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  darkSemanticColors,
  darkSystem,
  lightSemanticColors,
  system,
} from './chakraSystem'
import {
  sdlCard,
  sdlCardSurface,
  sdlElevation,
  sdlFonts,
  sdlTextAa,
  sdlTypeScale,
} from './styles'

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

/** A role's light value, such as `light('text', 'muted')`. */
function light(group: keyof typeof lightSemanticColors, role: string): string {
  const roles = lightSemanticColors[group] as Record<
    string,
    { value: { base: string } }
  >
  return roles[role].value.base
}

/** Every role path of a semantic colour tree, such as `status.warning.border`. */
function rolePaths(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, node]) =>
    'value' in node
      ? [`${prefix}${key}`]
      : rolePaths(node as object, `${prefix}${key}.`),
  )
}

function expectWithin(actual: number, expected: number, tolerance = 0.1) {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance)
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
  it('meets 4.5:1 on inverted hero and brand hero', () => {
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
    expect(theme).toContain('sdlTextAa.invertedMuted')
    expect(theme).toContain('sdlTextAa.onBrandMuted')
    expect(theme).toContain('sdlTextAa.onBrandSubtle')
  })
})

describe('light text roles (tone refresh)', () => {
  const surfaces = ['surface', 'canvas', 'subtle'].map((role) =>
    light('bg', role),
  )

  it('text.default, muted, subtle and link are AA on every light surface', () => {
    for (const role of ['default', 'muted', 'subtle', 'link']) {
      for (const surface of surfaces) {
        expect(
          contrastRatio(light('text', role), surface),
          `text.${role} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('keeps the ratios the spec lists', () => {
    const white = light('bg', 'surface')
    const subtleFill = light('bg', 'subtle')
    expectWithin(contrastRatio(light('text', 'default'), white), 18.6)
    expectWithin(contrastRatio(light('text', 'muted'), white), 7.7)
    expectWithin(contrastRatio(light('text', 'muted'), subtleFill), 7.0)
    expectWithin(contrastRatio(light('text', 'subtle'), white), 5.3)
    expectWithin(
      contrastRatio(light('text', 'subtle'), light('bg', 'canvas')),
      5.1,
    )
    expectWithin(contrastRatio(light('text', 'subtle'), subtleFill), 4.8)
    expectWithin(contrastRatio(light('text', 'link'), white), 6.9)
  })

  it('puts ink on the green fill, and green 600 passes as UI, not as text', () => {
    expect(
      contrastRatio(light('text', 'onGreen'), light('action', 'primary')),
    ).toBeGreaterThanOrEqual(10)
    // Green 600: focus rings, active bars and state icons (3:1 for UI).
    expect(
      contrastRatio(light('border', 'focus'), light('bg', 'surface')),
    ).toBeGreaterThanOrEqual(3)
    expect(light('accent', 'active')).toBe(light('border', 'focus'))
    // Green 400 on white is a fill only.
    expect(
      contrastRatio(light('action', 'primary'), light('bg', 'surface')),
    ).toBeLessThan(3)
  })

  it('status text is AA on its soft tint, the fill of a tag', () => {
    for (const family of ['success', 'warning', 'danger', 'info']) {
      const roles = lightSemanticColors.status[
        family as 'success' | 'warning' | 'danger' | 'info'
      ] as Record<string, { value: { base: string } }>
      expect(
        contrastRatio(roles.fg.value.base, roles.soft.value.base),
        `status.${family}.fg on soft`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('neutral tags (text.muted on bg.subtle) are AA', () => {
    expect(
      contrastRatio(light('text', 'muted'), light('bg', 'subtle')),
    ).toBeGreaterThanOrEqual(4.5)
  })
})

describe('tone refresh tokens (Train 1)', () => {
  it('moves the neutral ramp from green-tinted slate to zinc', () => {
    const ramp: Record<string, string> = {
      '0': '#FFFFFF',
      '50': '#FAFAFA',
      '100': '#F4F4F5',
      '200': '#E4E4E7',
      '300': '#D4D4D8',
      '400': '#A1A1AA',
      '500': '#71717A',
      '600': '#52525B',
      '700': '#3F3F46',
      '800': '#27272A',
      '900': '#0A1512',
    }
    for (const [step, hex] of Object.entries(ramp)) {
      expect(system.token(`colors.neutral.${step}`)).toBe(hex)
    }
  })

  it('keeps no green-tinted neutral: muted text on dark surfaces is zinc 300', () => {
    expect(sdlTextAa.invertedMuted).toBe(system.token('colors.neutral.300'))
  })

  it('sets the light roles', () => {
    expect(light('bg', 'canvas')).toBe('#FAFAFA')
    expect(light('bg', 'surface')).toBe('#FFFFFF')
    expect(light('bg', 'raised')).toBe('#FFFFFF')
    expect(light('bg', 'subtle')).toBe('#F4F4F5')
    expect(light('text', 'default')).toBe('#0A1512')
    expect(light('text', 'muted')).toBe('#52525B')
    expect(light('text', 'subtle')).toBe('#6B6B74')
    expect(light('text', 'link')).toBe('#05683F')
    expect(light('border', 'default')).toBe('#E4E4E7')
    expect(light('border', 'strong')).toBe('#D4D4D8')
    expect(light('border', 'hover')).toBe('#A1A1AA')
    expect(light('border', 'focus')).toBe('#02A567')
  })

  it('sets the tag borders by status family', () => {
    const status = lightSemanticColors.status
    expect(status.success.border.value.base).toBe('#C6F6DD')
    expect(status.warning.border.value.base).toBe('#FBE3B4')
    expect(status.danger.border.value.base).toBe('#FBD5D2')
    expect(status.info.border.value.base).toBe('#D3E5FD')
    expect(status.premium.border.value.base).toBe('#E6DEFD')
  })

  it('keeps green, plum and the status primitives', () => {
    expect(system.token('colors.green.400')).toBe('#00DC82')
    expect(system.token('colors.green.800')).toBe('#05683F')
    expect(system.token('colors.plum.500')).toBe('#6938EF')
    expect(system.token('colors.danger.solid')).toBe('#F04438')
  })

  it('leaves the existing dark roles as they were', () => {
    const dark = darkSemanticColors
    expect(dark.bg.canvas.value.base).toBe('#0C1310')
    expect(dark.bg.surface.value.base).toBe('#121A16')
    expect(dark.bg.subtle.value.base).toBe('#18221E')
    expect(dark.text.default.value.base).toBe('#F2F5F4')
    expect(dark.text.muted.value.base).toBe('#A6AFAB')
    expect(dark.text.subtle.value.base).toBe('#7E8783')
    expect(dark.text.link.value.base).toBe('#54DD9D')
    expect(dark.border.default.value.base).toBe('#283330')
    expect(dark.border.strong.value.base).toBe('#313D39')
    expect(dark.border.focus.value.base).toBe('#00DC82')
    expect(dark.status.success.border.value.base).toBe(
      'rgba(0, 220, 130, 0.32)',
    )
  })

  it('defines every light role in dark too, so no role is empty in one mode', () => {
    expect(rolePaths(darkSemanticColors).sort()).toEqual(
      rolePaths(lightSemanticColors).sort(),
    )
  })
})

describe('light roles render as declared', () => {
  // Chakra's default config also defines these names, with `_light` and `_dark`
  // values that mergeConfigs keeps beside our `base` and that win on
  // <html class="light">. Both were already shadowed before the tone refresh
  // (they render Chakra's black and gray.800); not part of Train 1.
  const SHADOWED_BEFORE_TRAIN_1 = new Set(['bg.inverted', 'border.inverted'])

  it('is not shadowed by a Chakra default `_light` value', () => {
    for (const path of rolePaths(lightSemanticColors)) {
      if (SHADOWED_BEFORE_TRAIN_1.has(path)) continue
      const conditions = system.tokens.getByName(`colors.${path}`)?.extensions
        .conditions as Record<string, string> | undefined
      expect(conditions?.base, path).toBeDefined()
      if (conditions?._light !== undefined) {
        expect(conditions._light, path).toBe(conditions.base)
      }
    }
  })

  it('renders bg.subtle as #F4F4F5, not gray.50', () => {
    const conditions = system.tokens.getByName('colors.bg.subtle')?.extensions
      .conditions as Record<string, string>
    expect(conditions._light).toBe('#F4F4F5')
  })

  it('renders the dark bg.subtle as #18221E, not Chakra gray.950 (dark values are unchanged)', () => {
    const conditions = darkSystem.tokens.getByName('colors.bg.subtle')
      ?.extensions.conditions as Record<string, string>
    expect(conditions.base).toBe('#18221E')
    expect(conditions._dark).toBe('#18221E')
    expect(conditions._light).toBe('#18221E')
  })
})

describe('typeface', () => {
  const sans =
    'var(--font-geist), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
  const mono =
    'var(--font-geist-mono), "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace'

  it('resolves display, heading and body to Geist, and mono to Geist Mono', () => {
    expect(sdlFonts.sans).toBe(sans)
    expect(sdlFonts.mono).toBe(mono)
    for (const token of ['display', 'heading', 'body']) {
      expect(system.token(`fonts.${token}`)).toBe(sans)
    }
    expect(system.token('fonts.mono')).toBe(mono)
  })

  it('sets the next/font variables on <html>, where Chakra resolves them (FE-468)', () => {
    const layout = readFileSync(
      join(process.cwd(), 'src/app/layout.tsx'),
      'utf8',
    )
    expect(layout).toContain("from 'next/font/google'")
    expect(layout).toContain("variable: '--font-geist'")
    expect(layout).toContain("variable: '--font-geist-mono'")
    expect(layout).toMatch(
      /<html[^>]*className=\{`\$\{geist\.variable\} \$\{geistMono\.variable\}`\}/,
    )
    expect(layout).not.toMatch(/<body[^>]*className/)
    expect(layout).not.toMatch(/Inter|Plus_Jakarta/)
  })

  it('sets the body font and canvas in globals.css', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
    expect(css).toContain('--background: #fafafa;')
    expect(css).toMatch(/font-family:\s*var\(--font-geist\),\s*["']Geist["']/)
    expect(css).not.toMatch(/--font-inter|--font-plus-jakarta/)
  })
})

describe('type scale', () => {
  it('keeps every heading at 500 and nothing heavier than 500', () => {
    for (const [role, step] of Object.entries(sdlTypeScale)) {
      expect(step.fontWeight, role).toBeLessThanOrEqual(500)
      if (role.startsWith('display') || role.startsWith('heading')) {
        expect(step.fontWeight, role).toBe(500)
      }
    }
  })

  it('has the spec sizes, line heights and tracking', () => {
    const rows: Array<[string, string, string, number, string]> = [
      ['display-2xl', '72px', '72px', 500, '-0.045em'],
      ['display-xl', '56px', '58px', 500, '-0.04em'],
      ['display-lg', '44px', '48px', 500, '-0.035em'],
      ['heading-xl', '34px', '41px', 500, '-0.03em'],
      ['heading-lg', '24px', '30px', 500, '-0.02em'],
      ['heading-md', '20px', '26px', 500, '-0.015em'],
      ['heading-sm', '18px', '24px', 500, '-0.01em'],
      ['text-lg', '18px', '28px', 400, '0'],
      ['text-md', '16px', '24px', 400, '0'],
      ['text-sm', '14px', '21px', 400, '0'],
      ['text-xs', '12px', '16px', 500, '0'],
      ['label-md', '14px', '17px', 500, '0'],
      ['label-sm', '12px', '14px', 500, '0.02em'],
      ['eyebrow', '12px', '16px', 500, '0.08em'],
      ['mono-sm', '14px', '21px', 500, '0'],
    ]
    expect(Object.keys(sdlTypeScale).sort()).toEqual(
      rows.map(([role]) => role).sort(),
    )
    for (const [role, size, line, weight, tracking] of rows) {
      expect(sdlTypeScale[role as keyof typeof sdlTypeScale]).toMatchObject({
        fontSize: size,
        lineHeight: line,
        fontWeight: weight,
        letterSpacing: tracking,
      })
    }
  })

  it('shrinks the largest display to 44/46 on a phone, and caps the eyebrow', () => {
    expect(sdlTypeScale['display-2xl'].phone).toEqual({
      fontSize: '44px',
      lineHeight: '46px',
    })
    expect(sdlTypeScale.eyebrow.textTransform).toBe('uppercase')
  })

  it('reaches Chakra as text styles, the eyebrow included', () => {
    for (const role of Object.keys(sdlTypeScale)) {
      expect(system.css({ textStyle: role }), role).toBeTruthy()
    }
    expect(system.css({ textStyle: 'eyebrow' })).toMatchObject({
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: '500',
    })
  })

  it('sets the Heading recipe to weight 500 with tracking by size', () => {
    const heading = system.getRecipe('heading') as {
      base: { fontWeight: string }
      variants: { size: Record<string, { letterSpacing?: string }> }
    }
    expect(heading.base.fontWeight).toBe('medium')
    const tracking: Record<string, string | undefined> = {
      xs: undefined,
      sm: undefined,
      md: undefined,
      lg: '-0.01em',
      xl: '-0.015em',
      '2xl': '-0.02em',
      '3xl': '-0.025em',
      '4xl': '-0.03em',
      '5xl': '-0.035em',
      '6xl': '-0.035em',
      '7xl': '-0.035em',
    }
    for (const [size, letterSpacing] of Object.entries(tracking)) {
      expect(heading.variants.size[size].letterSpacing, size).toBe(
        letterSpacing,
      )
    }
  })
})

describe('elevation scale', () => {
  it('is a hairline first, then the least shadow', () => {
    expect(sdlElevation).toEqual({
      e1: '0 1px 2px rgba(10, 21, 18, 0.04), 0 2px 10px rgba(10, 21, 18, 0.05)',
      e2: '0 2px 4px rgba(10, 21, 18, 0.05), 0 6px 16px rgba(10, 21, 18, 0.07)',
      e3: '0 0 0 1px rgba(10, 21, 18, 0.06), 0 8px 24px rgba(10, 21, 18, 0.08)',
      e4: '0 0 0 1px rgba(10, 21, 18, 0.04), 0 16px 40px rgba(10, 21, 18, 0.12)',
      e5: '0 25px 50px -12px rgba(10, 21, 18, 0.25)',
    })
  })

  it('gives e3 and e4 their own 1px ring, so their surfaces have no border', () => {
    expect(sdlElevation.e3.startsWith('0 0 0 1px')).toBe(true)
    expect(sdlElevation.e4.startsWith('0 0 0 1px')).toBe(true)
    expect(sdlElevation.e1.startsWith('0 0 0 1px')).toBe(false)
    expect(sdlElevation.e5.startsWith('0 0 0 1px')).toBe(false)
  })

  it('registers e1 to e5 as Chakra shadows', () => {
    for (const [name, value] of Object.entries(sdlElevation)) {
      expect(system.token(`shadows.${name}`)).toBe(value)
    }
    expect(system.token('shadows.card')).toBe(sdlElevation.e1)
  })
})

describe('elevation aliases in feature chrome', () => {
  it('does not use the leftover ghostBorder shadow', () => {
    const picker = readFileSync(
      join(
        process.cwd(),
        'src/app/(stepflow)/tasks/create/components/layout/map/TaskLocationMapPicker.tsx',
      ),
      'utf8',
    )
    expect(picker).not.toContain('ghostBorder')
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
    // The hero's search pill is a hairline with the `e1` resting elevation.
    expect(heroSearch).toContain("boxShadow: 'e1'")
    expect(heroSearch).not.toContain('rgba(0, 220, 130')
  })
})

describe('page shells', () => {
  // `bg.canvas` is the page; `bg.subtle` is a fill (tags, hovers, placeholders).
  // The shells used `bg.subtle` while Chakra's gray.50 shadowed it (FE-469), so
  // they only looked like the canvas by accident.
  const SHELLS = [
    'src/app/(auth)/layout.tsx',
    'src/app/(marketing)/layout.tsx',
    'src/app/(messages)/layout.tsx',
    'src/app/(stepflow)/layout.tsx',
    'src/app/(dashboard)/components/layout/AccountShell.tsx',
    'src/app/(stepflow)/tasks/[slug]/quote/components/TaskQuoteFlow.tsx',
    'src/app/StatusScreen.tsx',
    'src/ui/StepFlowLayout/StepFlowLayout.tsx',
  ]

  it('paint bg.canvas, not bg.subtle', () => {
    for (const file of SHELLS) {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      expect(source, file).toContain('bg="bg.canvas"')
      expect(source, file).not.toContain('bg="bg.subtle"')
    }
  })

  it('has a page header that defaults to the canvas', () => {
    const header = readFileSync(
      join(process.cwd(), 'src/ui/StickyHeader/StickyHeader.tsx'),
      'utf8',
    )
    expect(header).toContain("background = 'bg.canvas'")
  })
})

describe('decorative washes', () => {
  // Green stops at washes, bands, icon tiles and placeholders (spec: "Where
  // green goes, and where it stops"). Status tints, selected states and map
  // pins keep their colours, so only the decorative surfaces are listed.
  const NEUTRAL = [
    'src/ui/Footer/Footer.tsx',
    'src/ui/Card/Card.tsx',
    'src/app/(dashboard)/profile/components/ui/hero/ProfileIdentityHero.tsx',
    'src/app/(dashboard)/components/layout/DashboardSectionCard.tsx',
    'src/app/(marketing)/about/components/AboutScreen.tsx',
    'src/app/(marketing)/pricing/components/ui/plan/PricingPlanCards.tsx',
    'src/app/(presence)/profile/[userId]/components/ui/PublicProfileHero.tsx',
    'src/app/(stepflow)/tasks/[slug]/quote/components/ui/shared/TaskQuoteSummaryCard.tsx',
    'src/app/(stepflow)/tasks/[slug]/quote/components/ui/shared/TaskQuoteVisibilityCallout.tsx',
    'src/app/(stepflow)/worker/setup/components/ui/steps/WorkerSetupStepContent.tsx',
    'src/app/(auth)/components/ui/EmailVerificationBanner.tsx',
    'src/app/(task)/components/ui/TaskCardWorkerQuote.tsx',
    'src/app/(task)/tasks/[slug]/components/layout/TaskDetailView.tsx',
    'src/app/(task)/tasks/[slug]/components/summary/facts/BookingFacts.tsx',
    'src/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts.tsx',
    'src/app/(task)/tasks/[slug]/components/ui/TaskSectionSheet.tsx',
  ]

  it('has no mint tint or border on a decorative surface', () => {
    for (const file of NEUTRAL) {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      expect(source, file).not.toMatch(/status\.success\.(soft|border)/)
      expect(source, file).not.toMatch(/rgba\(0, ?220, ?130/)
    }
  })

  it('keeps green on the verified status page only', () => {
    const card = readFileSync(
      join(process.cwd(), 'src/app/(auth)/components/ui/AuthCard.tsx'),
      'utf8',
    )
    expect(card).toContain("tone = 'neutral'")
    expect(card).toContain("neutral: { bg: 'bg.subtle', color: 'text.muted' }")
    const verified = readFileSync(
      join(
        process.cwd(),
        'src/app/(auth)/verify-email/components/VerifyEmailScreen.tsx',
      ),
      'utf8',
    )
    expect(verified).toContain('tone="success"')
  })
})

describe('shape: sheets and dialogs keep their corners (FE-469 D4)', () => {
  // The spec's Shape table says "20 (unchanged)", but the website's dialogs and
  // sheets were 12px (`lg`) before the tone refresh and the app matches them.
  // Ryan decided on 28 Oct to keep the current radius, so the two apps agree.
  it('is 12px: the Modal dialog and every Drawer placement use radii.lg', () => {
    expect(system.token('radii.lg')).toBe('12px')
    const modal = readFileSync(
      join(process.cwd(), 'src/ui/Modal/Modal.tsx'),
      'utf8',
    )
    expect(modal).toMatch(
      /<DialogContent[^>]*\n\s*bg="bg.surface"\n\s*borderRadius="lg"/,
    )
    const drawer = readFileSync(
      join(process.cwd(), 'src/ui/Drawer/Drawer.tsx'),
      'utf8',
    )
    for (const side of [
      'borderLeftRadius',
      'borderRightRadius',
      'borderTopRadius',
      'borderBottomRadius',
    ]) {
      expect(drawer).toContain(`{ ${side}: 'lg' }`)
    }
  })
})

describe('green 400 is a fill, never a thin line (FE-469 D5)', () => {
  // Green 400 is 1.8:1 on white. Active and selected borders, connectors and
  // the spinner arc are green 600 (`accent.active`, 3.2:1 for UI). A border that
  // sits on a green 400 fill (a checked box, a selected date) is part of that
  // fill and stays.
  const LINES = [
    'src/ui/Card/Card.tsx',
    'src/ui/SlideToConfirm/SlideToConfirm.tsx',
    'src/ui/LanguageSwitcher/LanguageSwitcher.tsx',
    'src/ui/RadioButton/RadioButton.tsx',
    'src/app/(stepflow)/worker/setup/components/ui/inputs/WorkerSetupCategoryTiles.tsx',
    'src/app/(task)/components/ui/TaskCardWorkerQuote.tsx',
    'src/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts.tsx',
  ]

  it('draws those lines in accent.active', () => {
    for (const file of LINES) {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      expect(source, file).toContain('accent.active')
      expect(source, file).not.toMatch(
        /border\w*Color[=:][^\n]*(action\.primary|status\.success\.solid)/i,
      )
    }
  })

  it('draws the search spinner arc in accent.active', () => {
    const search = readFileSync(
      join(process.cwd(), 'src/app/(task)/components/ui/TaskSearch.tsx'),
      'utf8',
    )
    expect(search).toContain('<Spinner size="xs" color="accent.active"')
  })

  it('has no price text in green 400 on the white map pin: it is green 800', () => {
    const styles = readFileSync(
      join(process.cwd(), 'src/app/(task)/helpers/taskMap/pin/styles.ts'),
      'utf8',
    )
    expect(styles).not.toMatch(/color: PIN\.green,/)
    expect(styles.match(/color: PIN\.greenText,/g)).toHaveLength(3)
  })

  it('reads the quote timeline from semantic roles, not the neutral primitive (D6)', () => {
    const quote = readFileSync(
      join(
        process.cwd(),
        'src/app/(task)/components/ui/TaskCardWorkerQuote.tsx',
      ),
      'utf8',
    )
    expect(quote).toContain("'border.strong'")
    expect(quote).not.toMatch(/['"]neutral\.\d+['"]/)
  })
})

describe('neutral hover and press tints (FE-469 D3)', () => {
  // A hover or press tint is `bg.subtle`, not mint. Mint is for state: a
  // selected chip, row or tile keeps `status.success.soft`.
  const HOVERS = [
    'src/ui/Header/Header.tsx',
    'src/ui/IconButton/IconButton.tsx',
    'src/ui/RadioButton/RadioButton.tsx',
    'src/ui/MobileBottomNav/MobileBottomNav.tsx',
    'src/ui/FeedbackDialog/StarRatingInput.tsx',
    'src/app/(marketing)/components/layout/MarketingHeader.tsx',
    'src/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskCategoriesInput.tsx',
    'src/app/(stepflow)/worker/setup/components/ui/inputs/WorkerSetupChipsField.tsx',
    'src/app/(stepflow)/worker/setup/components/ui/inputs/WorkerSetupBioComposer.tsx',
  ]

  it('has no mint in a hover style', () => {
    for (const file of HOVERS) {
      const source = readFileSync(join(process.cwd(), file), 'utf8')
      const bodies = [
        ...source.matchAll(
          /(?:_hover|rowHover|ghostSurfaceHover)\s*[=:]\s*\{\{?([^}]*)\}/g,
        ),
      ].map((match) => match[1])
      expect(bodies.length, file).toBeGreaterThan(0)
      for (const body of bodies) {
        expect(body, file).not.toContain('status.success.soft')
      }
    }
  })

  it('keeps the bottom nav neutral: the Post task button is its only green', () => {
    const nav = readFileSync(
      join(process.cwd(), 'src/ui/MobileBottomNav/MobileBottomNav.tsx'),
      'utf8',
    )
    // The active tab is ink and the others text.subtle.
    expect(nav).toContain("active ? 'text.default' : 'text.subtle'")
    expect(nav).not.toMatch(/status\.success\.(fg|soft)/)
    expect(nav).not.toContain("'text.muted'")
  })
})

describe('no heavy weights in src', () => {
  /** Every .ts, .tsx, .mdx and .css file under `dir`, but not this test. */
  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) return sourceFiles(path)
      if (!/\.(tsx?|mdx|css)$/.test(name)) return []
      return path.endsWith('visualSystem.test.ts') ? [] : [path]
    })
  }

  // A weight of 700 to 900, or a bold keyword, on a `fontWeight` or `font-weight`.
  const HEAVY =
    /(?:fontWeight|font-weight)[^\n]*?(?<![.\w-])(?:[789]00|bold|bolder|extrabold|black)(?![\w%.])/

  it('has no 700, 800 or bold: headings are 500, figures 600', () => {
    const offenders = sourceFiles(join(process.cwd(), 'src')).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => HEAVY.test(line))
        .map(({ line, index }) => `${file}:${index + 1}: ${line.trim()}`),
    )
    expect(offenders).toEqual([])
  })
})

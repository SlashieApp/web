'use client'

import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from '@chakra-ui/react'

import { sdlElevation, sdlTypeScale } from './styles'

/**
 * SLASHIE DESIGN LANGUAGE (SDL) — Chakra theme = single source of truth.
 *
 * Two-tier tokens:
 *   1. PRIMITIVES (`tokens.colors.{green,neutral,plum,status}`) — raw scale values.
 *   2. SEMANTIC ROLES (`semanticTokens.colors.{bg,text,border,action,accent,status}`)
 *      — the ONLY thing components/pages reference. Never reference a primitive or hex
 *      directly in feature code.
 *
 * Light + dark are shipped as two systems sharing identical primitives; only the
 * semantic role VALUES differ (so "toggle flips semantic tokens, primitives unchanged").
 *
 * GREEN-INK RULE: `action.primary` (green-400 #00DC82) is too light for white text.
 * Every green fill pairs with `text.onGreen` (#0A1512 ink) in BOTH modes.
 */

/**
 * SDL type roles exposed as Chakra `textStyles`, so components can write
 * `textStyle="heading-md"` instead of re-deriving size/line-height/weight.
 * Generated from the single `sdlTypeScale` source; the font family is assigned by
 * role prefix (display/heading -> display face, mono -> mono, else -> body).
 */
const sdlTextStyles = Object.fromEntries(
  Object.entries(sdlTypeScale).map(([role, scale]) => {
    const fontFamily = role.startsWith('display')
      ? 'display'
      : role.startsWith('heading')
        ? 'heading'
        : role.startsWith('mono')
          ? 'mono'
          : 'body'
    return [
      role,
      {
        value: {
          fontFamily,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          fontWeight: `${scale.fontWeight}`,
        },
      },
    ]
  }),
)

const sharedTheme = {
  theme: {
    tokens: {
      colors: {
        green: {
          50: { value: '#E7FBF0' },
          100: { value: '#C6F6DD' },
          200: { value: '#92ECC0' },
          300: { value: '#54DD9D' },
          400: { value: '#00DC82' },
          500: { value: '#00C275' },
          600: { value: '#02A567' },
          700: { value: '#048654' },
          800: { value: '#05683F' },
          900: { value: '#053D27' },
        },
        neutral: {
          0: { value: '#FFFFFF' },
          50: { value: '#F7F9F8' },
          100: { value: '#EEF1F0' },
          200: { value: '#E0E5E3' },
          300: { value: '#C7CECB' },
          400: { value: '#9BA4A0' },
          500: { value: '#6E7873' },
          600: { value: '#515A56' },
          700: { value: '#3A423E' },
          800: { value: '#232A27' },
          900: { value: '#0A1512' },
        },
        plum: {
          50: { value: '#F4F1FE' },
          100: { value: '#E6DEFD' },
          400: { value: '#7A5AF8' },
          500: { value: '#6938EF' },
          600: { value: '#5925DC' },
          700: { value: '#4A1FB8' },
        },
        // Status primitives. `success` reuses the green family.
        warning: {
          soft: { value: '#FEF6E7' },
          fg: { value: '#8A5A00' },
          solid: { value: '#F5A300' },
        },
        danger: {
          soft: { value: '#FEF1F1' },
          fg: { value: '#B42318' },
          solid: { value: '#F04438' },
        },
        info: {
          soft: { value: '#EFF6FF' },
          fg: { value: '#175CD3' },
          solid: { value: '#2E90FA' },
        },
      },
      fonts: {
        // Display = marketing/display only. Body/ui = Inter. Mono = codes.
        display: {
          value:
            'var(--font-plus-jakarta), "Plus Jakarta Sans", Inter, system-ui, sans-serif',
        },
        heading: {
          value:
            'var(--font-plus-jakarta), "Plus Jakarta Sans", Inter, system-ui, sans-serif',
        },
        body: {
          value: 'var(--font-inter), "Inter", system-ui, sans-serif',
        },
        mono: {
          value: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
        },
      },
      fontSizes: {
        xs: { value: '12px' },
        sm: { value: '14px' },
        md: { value: '16px' },
        lg: { value: '18px' },
        xl: { value: '20px' },
        '2xl': { value: '24px' },
        '3xl': { value: '28px' },
        '4xl': { value: '36px' },
        '5xl': { value: '48px' },
      },
      radii: {
        sm: { value: '6px' },
        md: { value: '8px' },
        lg: { value: '12px' },
        xl: { value: '16px' },
        '2xl': { value: '20px' },
        full: { value: '9999px' },
      },
      shadows: {
        // SDL elevation scale (light). Named aliases + explicit e1..e5.
        e1: { value: sdlElevation.e1 },
        e2: { value: sdlElevation.e2 },
        e3: { value: sdlElevation.e3 },
        e4: { value: sdlElevation.e4 },
        e5: { value: sdlElevation.e5 },
        xs: { value: sdlElevation.e1 },
        sm: { value: sdlElevation.e2 },
        md: { value: sdlElevation.e3 },
        lg: { value: sdlElevation.e4 },
        xl: { value: sdlElevation.e5 },
        '2xl': { value: sdlElevation.e5 },
        card: { value: sdlElevation.e1 },
      },
    },
    textStyles: sdlTextStyles,
    keyframes: {
      /** Marketing entrance: fade + rise. Pair with a reduced-motion override. */
      'rise-in': {
        from: { opacity: '0', transform: 'translateY(28px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
}

/** Light-mode semantic roles. Components reference ONLY these (never primitives/hex). */
const lightSemanticColors = {
  bg: {
    canvas: { value: { base: '#F7F9F8' } },
    surface: { value: { base: '#FFFFFF' } },
    subtle: { value: { base: '#EEF1F0' } },
    raised: { value: { base: '#FFFFFF' } },
    /** Scrim behind modals/drawers - SDL ink wash, not pure black. */
    overlay: { value: { base: 'rgba(10, 21, 18, 0.55)' } },
    /** Dark-green marketing/auth hero surface (green.800). */
    brandHero: { value: { base: '#05683F' } },
    /** Translucent white glass card on the brand hero. */
    glass: { value: { base: 'rgba(255, 255, 255, 0.08)' } },
    /** Immersive dark ink surfaces (marketing hero/CTA bands). Mode-independent. */
    inverted: { value: { base: '#0C1310' } },
    invertedSurface: { value: { base: '#121A16' } },
    invertedRaised: { value: { base: '#1F2A25' } },
  },
  text: {
    default: { value: { base: '#0A1512' } },
    muted: { value: { base: '#515A56' } },
    subtle: { value: { base: '#9BA4A0' } },
    onGreen: { value: { base: '#0A1512' } },
    /** Text on the dark brand/auth hero (white + alphas; mode-independent). */
    onBrand: { value: { base: '#FFFFFF' } },
    onBrandMuted: { value: { base: 'rgba(255, 255, 255, 0.88)' } },
    onBrandSubtle: { value: { base: 'rgba(255, 255, 255, 0.75)' } },
    /** Text on `bg.inverted*` dark ink surfaces. Mode-independent. */
    onInverted: { value: { base: '#F2F5F4' } },
    onInvertedMuted: { value: { base: '#A6AFAB' } },
    /** Green link/accent text on dark surfaces (SDL dark-mode link value). */
    onInvertedLink: { value: { base: '#54DD9D' } },
    /**
     * Green ink for text. green-800: green-700 (#048654) is 4.37:1 on
     * `bg.canvas` (#F7F9F8) — just under WCAG AA 4.5:1 for normal text —
     * while green-800 passes on every light surface.
     */
    link: { value: { base: '#05683F' } },
  },
  border: {
    default: { value: { base: '#E0E5E3' } },
    strong: { value: { base: '#C7CECB' } },
    focus: { value: { base: '#02A567' } },
    /** White hairline on brand-hero glass cards. */
    glass: { value: { base: 'rgba(255, 255, 255, 0.14)' } },
    /** Hairline on `bg.inverted*` dark surfaces (SDL dark border.default). */
    inverted: { value: { base: '#283330' } },
  },
  action: {
    primary: { value: { base: '#00DC82' } },
    primaryHover: { value: { base: '#00C275' } },
    primaryPressed: { value: { base: '#02A567' } },
  },
  accent: {
    premium: { value: { base: '#6938EF' } },
  },
  status: {
    success: {
      soft: { value: { base: '#E7FBF0' } },
      fg: { value: { base: '#048654' } },
      solid: { value: { base: '#00DC82' } },
      /** Soft success-tinted border (parity with legacy green.200). */
      border: { value: { base: '#92ECC0' } },
    },
    warning: {
      soft: { value: { base: '#FEF6E7' } },
      fg: { value: { base: '#8A5A00' } },
      solid: { value: { base: '#F5A300' } },
    },
    danger: {
      soft: { value: { base: '#FEF1F1' } },
      fg: { value: { base: '#B42318' } },
      solid: { value: { base: '#F04438' } },
      /** Focus-ring wash for solid danger controls (tokenized from `solid`). */
      ring: { value: { base: 'rgba(240, 68, 56, 0.24)' } },
    },
    info: {
      soft: { value: { base: '#EFF6FF' } },
      fg: { value: { base: '#175CD3' } },
      solid: { value: { base: '#2E90FA' } },
    },
  },
} as const

/** Dark-mode semantic roles. Same keys as light; only values differ. */
const darkSemanticColors = {
  bg: {
    canvas: { value: { base: '#0C1310' } },
    surface: { value: { base: '#121A16' } },
    subtle: { value: { base: '#18221E' } },
    raised: { value: { base: '#1F2A25' } },
    /** Scrim behind modals/drawers - deeper wash for dark surfaces. */
    overlay: { value: { base: 'rgba(4, 8, 6, 0.7)' } },
    /** Dark-green marketing/auth hero surface (green.800). */
    brandHero: { value: { base: '#05683F' } },
    /** Translucent white glass card on the brand hero. */
    glass: { value: { base: 'rgba(255, 255, 255, 0.08)' } },
    /** Immersive dark ink surfaces (marketing hero/CTA bands). Mode-independent. */
    inverted: { value: { base: '#0C1310' } },
    invertedSurface: { value: { base: '#121A16' } },
    invertedRaised: { value: { base: '#1F2A25' } },
  },
  text: {
    default: { value: { base: '#F2F5F4' } },
    muted: { value: { base: '#A6AFAB' } },
    subtle: { value: { base: '#7E8783' } },
    onGreen: { value: { base: '#0A1512' } },
    /** Text on the dark brand/auth hero (white + alphas; mode-independent). */
    onBrand: { value: { base: '#FFFFFF' } },
    onBrandMuted: { value: { base: 'rgba(255, 255, 255, 0.88)' } },
    onBrandSubtle: { value: { base: 'rgba(255, 255, 255, 0.75)' } },
    /** Text on `bg.inverted*` dark ink surfaces. Mode-independent. */
    onInverted: { value: { base: '#F2F5F4' } },
    onInvertedMuted: { value: { base: '#A6AFAB' } },
    /** Green link/accent text on dark surfaces (SDL dark-mode link value). */
    onInvertedLink: { value: { base: '#54DD9D' } },
    link: { value: { base: '#54DD9D' } },
  },
  border: {
    default: { value: { base: '#283330' } },
    strong: { value: { base: '#313D39' } },
    focus: { value: { base: '#00DC82' } },
    /** White hairline on brand-hero glass cards. */
    glass: { value: { base: 'rgba(255, 255, 255, 0.14)' } },
    /** Hairline on `bg.inverted*` dark surfaces (SDL dark border.default). */
    inverted: { value: { base: '#283330' } },
  },
  action: {
    primary: { value: { base: '#00DC82' } },
    primaryHover: { value: { base: '#00C275' } },
    primaryPressed: { value: { base: '#02A567' } },
  },
  accent: {
    premium: { value: { base: '#7A5AF8' } },
  },
  status: {
    success: {
      soft: { value: { base: 'rgba(0, 220, 130, 0.16)' } },
      fg: { value: { base: '#54DD9D' } },
      solid: { value: { base: '#00DC82' } },
      /** Soft success-tinted border (dark). */
      border: { value: { base: 'rgba(0, 220, 130, 0.32)' } },
    },
    warning: {
      soft: { value: { base: 'rgba(245, 163, 0, 0.16)' } },
      fg: { value: { base: '#F5C66B' } },
      solid: { value: { base: '#F5A300' } },
    },
    danger: {
      soft: { value: { base: 'rgba(240, 68, 56, 0.16)' } },
      fg: { value: { base: '#FDA29B' } },
      solid: { value: { base: '#F04438' } },
      /** Focus-ring wash for solid danger controls (tokenized from `solid`). */
      ring: { value: { base: 'rgba(240, 68, 56, 0.32)' } },
    },
    info: {
      soft: { value: { base: 'rgba(46, 144, 250, 0.16)' } },
      fg: { value: { base: '#84CAFF' } },
      solid: { value: { base: '#2E90FA' } },
    },
  },
} as const

export const lightConfig = defineConfig({
  ...sharedTheme,
  theme: {
    ...sharedTheme.theme,
    semanticTokens: { colors: lightSemanticColors },
  },
})

export const darkConfig = defineConfig({
  ...sharedTheme,
  theme: {
    ...sharedTheme.theme,
    semanticTokens: { colors: darkSemanticColors },
  },
})

export const lightSystem = createSystem(
  mergeConfigs(defaultConfig, lightConfig),
)
export const darkSystem = createSystem(mergeConfigs(defaultConfig, darkConfig))

/** Backward-compatible default system for current providers (light). */
export const system = lightSystem

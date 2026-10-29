'use client'

import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from '@chakra-ui/react'

import { chakraBreakpoints } from './breakpoints'
import { PAGE_CONTAINER_MAX_W_CSS, PAGE_GUTTER_X } from './pageContainer'
import { sdlElevation, sdlFonts, sdlTextAa, sdlTypeScale } from './styles'

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
 * A role with a `phone` size takes it below `md`.
 */
const sdlTextStyles = Object.fromEntries(
  Object.entries(sdlTypeScale).map(([role, step]) => {
    const fontFamily = role.startsWith('display')
      ? 'display'
      : role.startsWith('heading')
        ? 'heading'
        : role.startsWith('mono')
          ? 'mono'
          : 'body'
    const phone = 'phone' in step ? step.phone : undefined
    const textTransform =
      'textTransform' in step ? step.textTransform : undefined
    return [
      role,
      {
        value: {
          fontFamily,
          fontSize: phone
            ? { base: phone.fontSize, md: step.fontSize }
            : step.fontSize,
          lineHeight: phone
            ? { base: phone.lineHeight, md: step.lineHeight }
            : step.lineHeight,
          fontWeight: `${step.fontWeight}`,
          letterSpacing: step.letterSpacing,
          ...(textTransform ? { textTransform } : {}),
        },
      },
    ]
  }),
)

/**
 * Chakra `Heading` sizes: weight 500 (`medium`), tracking by size. Sizes and
 * line heights stay Chakra's own (the `textStyle` of the same name); only the
 * weight and the tracking change. A size gets the tracking of its font size
 * (`fontSizes` below): up to 16px none, 18px -0.01em, 20px -0.015em, 24px
 * -0.02em, 28px -0.025em, 34 to 36px -0.03em, 44px and up -0.035em.
 * Chakra's own 4xl to 7xl text styles carry -0.025em, so those sizes say theirs
 * after the text style.
 */
const sdlHeadingSizes = {
  xs: { textStyle: 'xs' },
  sm: { textStyle: 'sm' },
  md: { textStyle: 'md' },
  lg: { textStyle: 'lg', letterSpacing: '-0.01em' },
  xl: { textStyle: 'xl', letterSpacing: '-0.015em' },
  '2xl': { textStyle: '2xl', letterSpacing: '-0.02em' },
  '3xl': { textStyle: '3xl', letterSpacing: '-0.025em' },
  '4xl': { textStyle: '4xl', letterSpacing: '-0.03em' },
  '5xl': { textStyle: '5xl', letterSpacing: '-0.035em' },
  '6xl': { textStyle: '6xl', letterSpacing: '-0.035em' },
  '7xl': { textStyle: '7xl', letterSpacing: '-0.035em' },
} as const

const sharedTheme = {
  theme: {
    breakpoints: chakraBreakpoints,
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
        // Zinc (tone refresh, Train 1); 900 is the unchanged ink.
        neutral: {
          0: { value: '#FFFFFF' },
          50: { value: '#FAFAFA' },
          100: { value: '#F4F4F5' },
          200: { value: '#E4E4E7' },
          300: { value: '#D4D4D8' },
          400: { value: '#A1A1AA' },
          500: { value: '#71717A' },
          600: { value: '#52525B' },
          700: { value: '#3F3F46' },
          800: { value: '#27272A' },
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
        // Geist for display, headings and body; Geist Mono for codes. The
        // variables come from next/font on <html> (src/app/layout.tsx), the
        // element these tokens resolve on (FE-468).
        display: { value: sdlFonts.sans },
        heading: { value: sdlFonts.sans },
        body: { value: sdlFonts.sans },
        mono: { value: sdlFonts.mono },
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
      sizes: {
        /** Page column — default `<Container>` max width (worker detail). */
        page: { value: PAGE_CONTAINER_MAX_W_CSS },
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
    recipes: {
      container: {
        base: {
          maxWidth: 'page',
          px: PAGE_GUTTER_X,
        },
      },
      heading: {
        base: { fontWeight: 'medium' },
        variants: { size: sdlHeadingSizes },
      },
    },
    keyframes: {
      /**
       * Marketing entrance, tone train 2: a fade with an 8px rise (the same rise
       * as the landing `Reveal`). Run it 400ms on `sdlMotion.easing.decelerate`,
       * once, and pair it with a reduced-motion override. (It replaces the old
       * `rise-in`, a 28px rise that only the landing phone demo used.)
       */
      'fade-rise': {
        from: { opacity: '0', transform: 'translateY(8px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      /** Landing phone demo: "tap here" ring. Pair with a reduced-motion override. */
      'tap-pulse': {
        '0%': { opacity: '0.7', transform: 'scale(0.92)' },
        '70%': { opacity: '0', transform: 'scale(1.18)' },
        '100%': { opacity: '0', transform: 'scale(1.18)' },
      },
      /** Typing dots in the landing chat demo. */
      'typing-dot': {
        '0%, 80%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
        '40%': { opacity: '1', transform: 'translateY(-3px)' },
      },
    },
  },
}

/** Light-mode semantic roles. Components reference ONLY these (never primitives/hex). */
export const lightSemanticColors = {
  bg: {
    canvas: { value: { base: '#FAFAFA' } },
    surface: { value: { base: '#FFFFFF' } },
    /**
     * `_light` as well as `base`: Chakra's own `bg.subtle` has `_light` and
     * `_dark` values that mergeConfigs keeps beside ours, and on
     * `<html class="light">` they win, so `base` alone renders gray.50 (FE-469).
     */
    subtle: { value: { base: '#F4F4F5', _light: '#F4F4F5' } },
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
    /** 7.7:1 on white, 7.0:1 on `bg.subtle`. */
    muted: { value: { base: '#52525B' } },
    /**
     * Placeholders, eyebrows, inactive tabs: 5.3:1 on white, 5.1 on `bg.canvas`,
     * 4.8 on `bg.subtle`, so it is AA on every light surface (zinc 500 is
     * 4.4:1 on `bg.subtle`, one step too light).
     */
    subtle: { value: { base: '#6B6B74' } },
    onGreen: { value: { base: '#0A1512' } },
    /** Text on the dark brand/auth hero (white + alphas; mode-independent). */
    onBrand: { value: { base: '#FFFFFF' } },
    onBrandMuted: { value: { base: sdlTextAa.onBrandMuted } },
    onBrandSubtle: { value: { base: sdlTextAa.onBrandSubtle } },
    /** Text on `bg.inverted*` dark ink surfaces. Mode-independent. */
    onInverted: { value: { base: '#F2F5F4' } },
    onInvertedMuted: { value: { base: sdlTextAa.invertedMuted } },
    /** Green link/accent text on dark surfaces (SDL dark-mode link value). */
    onInvertedLink: { value: { base: '#54DD9D' } },
    /**
     * Green ink for text. green-800: green-700 (#048654) is 4.43:1 on
     * `bg.canvas` (#FAFAFA), just under WCAG AA 4.5:1 for normal text,
     * while green-800 passes on every light surface.
     */
    link: { value: { base: '#05683F' } },
  },
  border: {
    default: { value: { base: '#E4E4E7' } },
    strong: { value: { base: '#D4D4D8' } },
    /** Outline pills and fields on hover: one step darker than `strong`. */
    hover: { value: { base: '#A1A1AA' } },
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
    /**
     * Active bars (tabs, stepper) and state icons: green 600, 3.2:1 on white,
     * for UI only, never text. Green 400 is for fills.
     */
    active: { value: { base: '#02A567' } },
  },
  status: {
    success: {
      soft: { value: { base: '#E7FBF0' } },
      // green-800: green-700 (#048654) was 4.07-4.37:1 on bg.subtle / the
      // soft tint / bg.canvas (under WCAG AA 4.5:1), same fix as text.link.
      fg: { value: { base: '#05683F' } },
      solid: { value: { base: '#00DC82' } },
      /** Tag border: the 1px edge of a tinted tag (green 100). */
      border: { value: { base: '#C6F6DD' } },
    },
    warning: {
      soft: { value: { base: '#FEF6E7' } },
      fg: { value: { base: '#8A5A00' } },
      solid: { value: { base: '#F5A300' } },
      border: { value: { base: '#FBE3B4' } },
    },
    danger: {
      soft: { value: { base: '#FEF1F1' } },
      fg: { value: { base: '#B42318' } },
      solid: { value: { base: '#F04438' } },
      border: { value: { base: '#FBD5D2' } },
      /** Focus-ring wash for solid danger controls (tokenized from `solid`). */
      ring: { value: { base: 'rgba(240, 68, 56, 0.24)' } },
    },
    info: {
      soft: { value: { base: '#EFF6FF' } },
      fg: { value: { base: '#175CD3' } },
      solid: { value: { base: '#2E90FA' } },
      border: { value: { base: '#D3E5FD' } },
    },
    /** Premium (plum) tags: only the border is a status role so far. */
    premium: {
      border: { value: { base: '#E6DEFD' } },
    },
  },
} as const

/** Dark-mode semantic roles. Same keys as light; only values differ. */
export const darkSemanticColors = {
  bg: {
    canvas: { value: { base: '#0C1310' } },
    surface: { value: { base: '#121A16' } },
    /**
     * `_light` and `_dark` as well as `base`, as in the light system: Chakra's
     * own `bg.subtle` (gray.50, gray.950) is kept beside ours and wins on
     * `<html class="dark">`, so `base` alone renders gray.950 (FE-469). The
     * value is unchanged in Train 1.
     */
    subtle: { value: { base: '#18221E', _light: '#18221E', _dark: '#18221E' } },
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
    onBrandMuted: { value: { base: sdlTextAa.onBrandMuted } },
    onBrandSubtle: { value: { base: sdlTextAa.onBrandSubtle } },
    /** Text on `bg.inverted*` dark ink surfaces. Mode-independent. */
    onInverted: { value: { base: '#F2F5F4' } },
    onInvertedMuted: { value: { base: sdlTextAa.invertedMuted } },
    /** Green link/accent text on dark surfaces (SDL dark-mode link value). */
    onInvertedLink: { value: { base: '#54DD9D' } },
    link: { value: { base: '#54DD9D' } },
  },
  border: {
    default: { value: { base: '#283330' } },
    strong: { value: { base: '#313D39' } },
    /**
     * A step up from `strong`, so an outline control still answers a hover in
     * dark now that its hover fill is gone. Provisional until the dark retune.
     */
    hover: { value: { base: '#4A5953' } },
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
    /** Dark keeps green 400 for active bars. */
    active: { value: { base: '#00DC82' } },
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
      border: { value: { base: 'rgba(245, 163, 0, 0.32)' } },
    },
    danger: {
      soft: { value: { base: 'rgba(240, 68, 56, 0.16)' } },
      fg: { value: { base: '#FDA29B' } },
      solid: { value: { base: '#F04438' } },
      border: { value: { base: 'rgba(240, 68, 56, 0.32)' } },
      /** Focus-ring wash for solid danger controls (tokenized from `solid`). */
      ring: { value: { base: 'rgba(240, 68, 56, 0.32)' } },
    },
    info: {
      soft: { value: { base: 'rgba(46, 144, 250, 0.16)' } },
      fg: { value: { base: '#84CAFF' } },
      solid: { value: { base: '#2E90FA' } },
      border: { value: { base: 'rgba(46, 144, 250, 0.32)' } },
    },
    premium: {
      border: { value: { base: 'rgba(122, 90, 248, 0.32)' } },
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

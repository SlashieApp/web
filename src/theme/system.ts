import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from '@chakra-ui/react'

import {
  cardSemanticColors,
  darkCardSurface,
  lightCardSurface,
} from './cardPalette'
import {
  darkFormField,
  formSemanticColors,
  lightFormField,
} from './formPalette'
import {
  darkIntentPalette,
  darkIntentPrimaryIcon,
  intentSemanticColors,
  lightIntentPalette,
  lightIntentPrimaryIcon,
} from './intentPalette'

const sharedTheme = {
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: '#ecfdf5' },
          100: { value: '#d1fae5' },
          200: { value: '#a7f3d0' },
          300: { value: '#6ee7b7' },
          400: { value: '#34d399' },
          500: { value: '#00dc82' },
          600: { value: '#10b981' },
          700: { value: '#059669' },
          800: { value: '#047857' },
          900: { value: '#065f46' },
        },
        secondary: {
          50: { value: '#f0fdf9' },
          100: { value: '#ccfbf1' },
          200: { value: '#99f6e4' },
          300: { value: '#5eead4' },
          400: { value: '#2dd4bf' },
          500: { value: '#10b981' },
          600: { value: '#0d9f71' },
          700: { value: '#0f766e' },
          800: { value: '#115e59' },
          900: { value: '#134e4a' },
        },
        tertiary: {
          50: { value: '#f1fcfc' },
          100: { value: '#d9f7f7' },
          200: { value: '#bceeee' },
          300: { value: '#93e0e0' },
          400: { value: '#6aced0' },
          500: { value: '#54bbbb' },
          600: { value: '#3f9b9b' },
          700: { value: '#337d7d' },
          800: { value: '#2d6565' },
          900: { value: '#285454' },
        },
        neutral: {
          50: { value: '#ffffff' },
          100: { value: '#f7f8f7' },
          200: { value: '#eff1f0' },
          300: { value: '#e4e7e5' },
          400: { value: '#d5dad8' },
          500: { value: '#b9c0bd' },
          600: { value: '#777777' },
        },
        ink: {
          700: { value: '#2b332f' },
          800: { value: '#1f2623' },
          900: { value: '#151a18' },
        },
        // Compatibility aliases for existing code paths.
        linkBlue: {
          50: { value: '#ecfdf5' },
          100: { value: '#d1fae5' },
          200: { value: '#a7f3d0' },
          300: { value: '#6ee7b7' },
          400: { value: '#34d399' },
          500: { value: '#00dc82' },
          600: { value: '#10b981' },
          700: { value: '#059669' },
          800: { value: '#047857' },
          900: { value: '#065f46' },
        },
        mustard: {
          50: { value: '#fff4e4' },
          100: { value: '#ffddb8' },
          200: { value: '#ffcd91' },
          300: { value: '#ffbc66' },
          400: { value: '#fea619' },
          500: { value: '#cb7f08' },
          600: { value: '#855300' },
          700: { value: '#6a4300' },
          800: { value: '#513200' },
          900: { value: '#3a2400' },
        },
      },
      fonts: {
        heading: {
          value:
            'var(--font-plus-jakarta), "Plus Jakarta Sans", Inter, system-ui, sans-serif',
        },
        body: {
          value: 'var(--font-inter), "Inter", Inter, system-ui, sans-serif',
        },
      },
      fontSizes: {
        xs: { value: '12px' },
      },
      radii: {
        sm: { value: '6px' },
        md: { value: '8px' },
        lg: { value: '12px' },
        xl: { value: '16px' },
      },
      shadows: {
        card: { value: '0 8px 24px rgba(0, 0, 0, 0.08)' },
        ambient: { value: '0 24px 48px rgba(0, 0, 0, 0.4)' },
        ghostBorder: { value: 'inset 0 0 0 1px rgba(119, 119, 119, 0.15)' },
        primary: { value: '0 14px 36px rgba(0, 220, 130, 0.15)' },
      },
    },
  },
}

export const lightConfig = defineConfig({
  ...sharedTheme,
  theme: {
    ...sharedTheme.theme,
    semanticTokens: {
      colors: {
        bg: { value: { base: '#f7f8f7' } },
        primary: {
          value: {
            base: 'linear-gradient(to top right, #00DC82 0%, #00e69d 100%)',
          },
        },
        primaryHover: {
          value: {
            base: 'linear-gradient(to top right, #00DC82 0%, #00e69d 50%)',
          },
        },
        secondary: { value: { base: '#00A572' } },
        tertiary: { value: { base: '#54BBBB' } },
        ...intentSemanticColors(lightIntentPalette, lightIntentPrimaryIcon),
        ...cardSemanticColors(lightCardSurface),
        ...formSemanticColors(lightFormField),
        // Metadata chip (e.g. timestamps)
        badgeBg: { value: { base: '#e4e7e5' } },
        badgeFg: { value: { base: '#4f5854' } },
      },
    },
  },
})

export const darkConfig = defineConfig({
  ...sharedTheme,
  theme: {
    ...sharedTheme.theme,
    semanticTokens: {
      colors: {
        bg: { value: { base: '#222222' } },
        primary: {
          value: {
            base: 'linear-gradient(to top right, #00DC82 0%, #00A572 100%)',
          },
        },
        primaryHover: {
          value: {
            base: 'linear-gradient(to top right, #00DC82 0%, #00A572 50%)',
          },
        },
        secondary: { value: { base: '#00A572' } },
        tertiary: { value: { base: '#54BBBB' } },
        ...intentSemanticColors(darkIntentPalette, darkIntentPrimaryIcon),
        ...cardSemanticColors(darkCardSurface),
        ...formSemanticColors(darkFormField),
        badgeBg: { value: { base: '#333333' } },
        badgeFg: { value: { base: '#a8b4c4' } },
      },
    },
  },
})

export const lightSystem = createSystem(
  mergeConfigs(defaultConfig, lightConfig),
)
export const darkSystem = createSystem(mergeConfigs(defaultConfig, darkConfig))

// Backward-compatible default system for current providers.
export const system = lightSystem

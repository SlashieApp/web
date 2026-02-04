import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'

// Warm “local trades” theme:
// - warm neutrals + soft green accent
// - glass / translucent panels
// - rounded corners
export const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#fff7ed' },
          100: { value: '#ffedd5' },
          200: { value: '#fed7aa' },
          300: { value: '#fdba74' },
          400: { value: '#fb923c' },
          500: { value: '#f97316' },
          600: { value: '#ea580c' },
          700: { value: '#c2410c' },
          800: { value: '#9a3412' },
          900: { value: '#7c2d12' }
        },
        moss: {
          50: { value: '#f0fdf4' },
          100: { value: '#dcfce7' },
          200: { value: '#bbf7d0' },
          300: { value: '#86efac' },
          400: { value: '#4ade80' },
          500: { value: '#22c55e' },
          600: { value: '#16a34a' },
          700: { value: '#15803d' },
          800: { value: '#166534' },
          900: { value: '#14532d' }
        }
      },
      radii: {
        sm: { value: '10px' },
        md: { value: '14px' },
        lg: { value: '18px' },
        xl: { value: '24px' }
      },
      shadows: {
        glass: {
          value:
            '0 10px 30px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.25) inset'
        }
      }
    },
    semanticTokens: {
      colors: {
        bg: {
          value: {
            base: '#fffaf5'
          }
        },
        fg: {
          value: {
            base: '#1f2937'
          }
        },
        muted: {
          value: {
            base: 'rgba(31,41,55,0.70)'
          }
        },
        glassBg: {
          value: {
            base: 'rgba(255,255,255,0.55)'
          }
        },
        glassBorder: {
          value: {
            base: 'rgba(31,41,55,0.10)'
          }
        }
      }
    }
  }
})

export const system = createSystem(mergeConfigs(defaultConfig, customConfig))

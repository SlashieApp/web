import { createSystem, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react'

// HandyBox theme (Notion-like):
// - clean black/white base
// - solid accent colors: Notion link blue + warm mustard
// - soft borders, gentle shadows, rounded corners
// - subtle motion
export const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        ink: {
          50: { value: '#f7f7f7' },
          100: { value: '#eaeaea' },
          200: { value: '#d6d6d6' },
          300: { value: '#bdbdbd' },
          400: { value: '#9b9b9b' },
          500: { value: '#6b6b6b' },
          600: { value: '#3c3c3c' },
          700: { value: '#222222' },
          800: { value: '#161616' },
          900: { value: '#0f0f0f' }
        },
        linkBlue: {
          50: { value: '#eef6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#3b82f6' },
          600: { value: '#2563eb' },
          700: { value: '#1d4ed8' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' }
        },
        mustard: {
          50: { value: '#fffbe6' },
          100: { value: '#fff4bf' },
          200: { value: '#ffe58f' },
          300: { value: '#ffd666' },
          400: { value: '#ffc53d' },
          500: { value: '#d4a72c' },
          600: { value: '#b38622' },
          700: { value: '#8f6619' },
          800: { value: '#6b4a10' },
          900: { value: '#4d350a' }
        }
      },
      radii: {
        sm: { value: '10px' },
        md: { value: '14px' },
        lg: { value: '18px' },
        xl: { value: '22px' }
      },
      shadows: {
        card: {
          value: '0 10px 30px rgba(0,0,0,0.08)'
        }
      }
    },
    semanticTokens: {
      colors: {
        bg: { value: { base: '#ffffff' } },
        fg: { value: { base: '#111111' } },
        muted: { value: { base: 'rgba(17,17,17,0.70)' } },

        surface: { value: { base: '#ffffff' } },
        border: { value: { base: 'rgba(17,17,17,0.12)' } },

        // Keep naming compatible with existing components
        glassBg: { value: { base: 'rgba(255,255,255,0.72)' } },
        glassBorder: { value: { base: 'rgba(17,17,17,0.12)' } }
      }
    }
  }
})

export const system = createSystem(mergeConfigs(defaultConfig, customConfig))

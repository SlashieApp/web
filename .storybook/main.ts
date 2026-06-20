import type { StorybookConfig } from '@storybook/nextjs-vite'
import type { RollupLog } from 'rollup'
import { type UserConfig, mergeConfig } from 'vite'
import graphqlLoader from 'vite-plugin-graphql-loader'

const isStaticBuild =
  process.env.npm_lifecycle_event === 'build-storybook' ||
  process.env.npm_lifecycle_event === 'prebuild-storybook'

/** Harmless Rollup noise from Next `"use client"` boundaries in dependencies (e.g. framer-motion). */
function isIgnorableRollupWarning(warning: RollupLog): boolean {
  const message = warning.message ?? ''
  return (
    message.includes('Module level directives cause errors when bundled') ||
    message.includes("Can't resolve original location of error")
  )
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // @chakra-ui/react declares a storybook ref in package.json; disable it to avoid
  // CORS errors fetching https://storybook.chakra-ui.com/metadata.json
  refs: {
    '@chakra-ui/react': {
      disable: true,
    },
  },
  addons: [
    '@chromatic-com/storybook',
    // Vitest UI is dev-only; excluding it keeps static builds smaller and avoids test-runtime bundling on Vercel.
    ...(isStaticBuild ? [] : ['@storybook/addon-vitest']),
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  async viteFinal(userConfig, { configType }) {
    const productionBuild: UserConfig =
      configType === 'PRODUCTION'
        ? {
            build: {
              sourcemap: false,
              chunkSizeWarningLimit: 3000,
              rollupOptions: {
                onwarn(warning, defaultHandler) {
                  if (isIgnorableRollupWarning(warning)) return
                  defaultHandler(warning)
                },
              },
            },
            esbuild: {
              legalComments: 'none',
            },
            plugins: [graphqlLoader()],
          }
        : { plugins: [graphqlLoader()] }

    return mergeConfig(userConfig, productionBuild)
  },
}
export default config

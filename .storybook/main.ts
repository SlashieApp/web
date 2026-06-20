import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import type { RollupLog } from 'rollup'
import { type UserConfig, mergeConfig } from 'vite'
import graphqlLoader from 'vite-plugin-graphql-loader'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const schemaPath = resolve(rootDir, '.codegen/schema.ts')

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

function schemaAliasConfig(
  configType: 'DEVELOPMENT' | 'PRODUCTION',
): UserConfig['resolve'] {
  if (!existsSync(schemaPath)) {
    const message = `[storybook] ${schemaPath} not found. Run \`bun run build-storybook\` (or \`node scripts/prebuild-storybook.mjs\`) before building.`
    if (configType === 'PRODUCTION') {
      throw new Error(message)
    }
    console.warn(message)
    return undefined
  }

  return {
    alias: [{ find: '@codegen/schema', replacement: schemaPath }],
  }
}

const chakraStorybookOrigin = 'https://storybook.chakra-ui.com'
/** Same-origin proxy in dev — avoids CORS on metadata.json 404 from Chakra's host. */
const chakraStorybookDevPath = '/chakra-ui-storybook'

const chakraRef = {
  title: 'Chakra UI',
  url: isStaticBuild ? chakraStorybookOrigin : chakraStorybookDevPath,
  expanded: true,
} as const

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  refs: {
    // Explicit ref (see https://github.com/chakra-ui/chakra-ui/pull/5133).
    'chakra-ui': chakraRef,
    // Disable auto-discovery from @chakra-ui/react package.json (same URL, avoids duplicate/broken ref).
    '@chakra-ui/react': { disable: true },
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
    const schemaResolve = schemaAliasConfig(configType)

    const chakraProxy: UserConfig['server'] = isStaticBuild
      ? undefined
      : {
          proxy: {
            [chakraStorybookDevPath]: {
              target: chakraStorybookOrigin,
              changeOrigin: true,
              rewrite: (path) => path.replace(chakraStorybookDevPath, ''),
            },
          },
        }

    const productionBuild: UserConfig =
      configType === 'PRODUCTION'
        ? {
            resolve: schemaResolve,
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
        : {
            resolve: schemaResolve,
            plugins: [graphqlLoader()],
            server: chakraProxy,
          }

    const merged = mergeConfig(userConfig, productionBuild)

    if (!existsSync(schemaPath)) {
      return merged
    }

    const existingAlias = Array.isArray(merged.resolve?.alias)
      ? merged.resolve.alias
      : merged.resolve?.alias
        ? Object.entries(merged.resolve.alias).map(([find, replacement]) => ({
            find,
            replacement,
          }))
        : []

    const withoutCodegen = existingAlias.filter((entry) => {
      if (typeof entry === 'string') return entry !== '@codegen/schema'
      if (entry instanceof RegExp) return entry.source !== '@codegen\\/schema'
      return entry.find !== '@codegen/schema'
    })

    return mergeConfig(merged, {
      resolve: {
        alias: [
          { find: '@codegen/schema', replacement: schemaPath },
          ...withoutCodegen,
        ],
      },
    })
  },
}
export default config

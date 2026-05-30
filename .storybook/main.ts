import type { StorybookConfig } from '@storybook/nextjs-vite'
import { type UserConfig, mergeConfig } from 'vite'
import graphqlLoader from 'vite-plugin-graphql-loader'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  async viteFinal(userConfig, { configType }) {
    const extra: UserConfig =
      configType === 'PRODUCTION'
        ? {
            build: {
              sourcemap: false,
            },
            esbuild: {
              legalComments: 'none',
            },
            plugins: [graphqlLoader()],
          }
        : { plugins: [graphqlLoader()] }
    return mergeConfig(userConfig, extra)
  },
}
export default config

import type { StorybookConfig } from '@storybook/nextjs-vite'
import { type UserConfig, mergeConfig } from 'vite'
import graphqlLoader from 'vite-plugin-graphql-loader'

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

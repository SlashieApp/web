import { create } from 'storybook/theming'

export default create({
  base: 'light',
  brandTitle: 'Slashie UI',
  brandUrl: 'https://slashie.app',
  brandImage: '/images/slashie-logo-light.svg',
  brandTarget: '_self',
  fontBase: '"Geist", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, monospace',
  // SDL semantic values (light). The manager chrome is a fixed light theme; the
  // preview canvas follows the light/dark toggle via .storybook/preview-head.html.
  colorPrimary: '#00dc82', // action.primary
  colorSecondary: '#048654', // text.link (green ink)
  appBg: '#FAFAFA', // bg.canvas
  appContentBg: '#FFFFFF', // bg.surface
  appPreviewBg: '#FAFAFA', // bg.canvas
  barBg: '#FFFFFF', // bg.surface
  appBorderColor: '#E4E4E7', // border.default
  appBorderRadius: 8, // radii.md
  textColor: '#0A1512', // text.default
  textMutedColor: '#52525B', // text.muted
  barTextColor: '#52525B', // text.muted
  barSelectedColor: '#048654', // text.link
})

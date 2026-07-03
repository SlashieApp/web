import { create } from 'storybook/theming'

export default create({
  base: 'light',
  brandTitle: 'Slashie UI',
  brandUrl: 'https://slashie.app',
  brandImage: '/images/slashie-logo-light.png',
  brandTarget: '_self',
  fontBase: '"Plus Jakarta Sans","Inter", "montserrat","Open Sans", sans-serif',
  fontCode: 'monospace',
  // SDL semantic values (light). The manager chrome is a fixed light theme; the
  // preview canvas follows the light/dark toggle via .storybook/preview-head.html.
  colorPrimary: '#00dc82', // action.primary
  colorSecondary: '#048654', // text.link (green ink)
  appBg: '#F7F9F8', // bg.canvas
  appContentBg: '#FFFFFF', // bg.surface
  appPreviewBg: '#F7F9F8', // bg.canvas
  barBg: '#FFFFFF', // bg.surface
  appBorderColor: '#E0E5E3', // border.default
  appBorderRadius: 8, // radii.md
  textColor: '#0A1512', // text.default
  textMutedColor: '#515A56', // text.muted
  barTextColor: '#515A56', // text.muted
  barSelectedColor: '#048654', // text.link
})

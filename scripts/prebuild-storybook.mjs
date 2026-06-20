import { execSync } from 'node:child_process'

console.log('[prebuild-storybook] Ensuring GraphQL schema…')
execSync('node scripts/ensure-codegen.mjs', {
  stdio: 'inherit',
  env: process.env,
})

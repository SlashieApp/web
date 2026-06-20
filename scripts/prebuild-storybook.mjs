import { execSync } from 'node:child_process'

console.log('[prebuild-storybook] Running app prebuild (exports + codegen)…')
execSync('node scripts/prebuild.mjs', { stdio: 'inherit' })

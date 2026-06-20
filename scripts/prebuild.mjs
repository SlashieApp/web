import { execSync } from 'node:child_process'

console.log('[prebuild] Generating export barrels…')
execSync('npm run exports-gen', { stdio: 'inherit', env: process.env })

execSync('node scripts/ensure-codegen.mjs', {
  stdio: 'inherit',
  env: process.env,
})

console.log('[prebuild] Done.')

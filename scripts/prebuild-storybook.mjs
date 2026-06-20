import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL
const token = process.env.SCHEMA_ACCESS_TOKEN

if (!url || !token) {
  console.warn(
    '[prebuild-storybook] Skipping codegen: stories no longer require .codegen/schema.ts.',
  )
  process.exit(0)
}

if (existsSync('.codegen/schema.ts')) {
  console.warn(
    '[prebuild-storybook] .codegen/schema.ts already present; skipping codegen.',
  )
  process.exit(0)
}

execSync('graphql-codegen --config codegen.ts', { stdio: 'inherit' })

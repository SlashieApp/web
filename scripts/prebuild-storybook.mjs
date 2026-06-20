import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL
const token = process.env.SCHEMA_ACCESS_TOKEN

if (!url || !token) {
  if (existsSync('.codegen/schema.ts')) {
    console.warn(
      '[prebuild-storybook] Skipping codegen: env vars missing but .codegen/schema.ts exists.',
    )
    process.exit(0)
  }

  console.error(
    [
      '[prebuild-storybook] GraphQL codegen failed: missing environment variables.',
      'Set NEXT_PUBLIC_GRAPHQL_URL and SCHEMA_ACCESS_TOKEN on Vercel (or in .env locally).',
    ].join('\n'),
  )
  process.exit(1)
}

execSync('graphql-codegen --config codegen.ts', { stdio: 'inherit' })

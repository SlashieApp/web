import { execSync } from 'node:child_process'
import { config as loadEnv } from 'dotenv'

loadEnv()

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
const token = process.env.SCHEMA_ACCESS_TOKEN?.trim()

if (!url || !token) {
  console.error(
    [
      '[prebuild-storybook] Missing required environment variables.',
      'Set NEXT_PUBLIC_GRAPHQL_URL and SCHEMA_ACCESS_TOKEN (e.g. in .env or on Vercel).',
    ].join('\n'),
  )
  process.exit(1)
}

console.log('[prebuild-storybook] Fetching GraphQL schema…')
execSync('bun run codegen', { stdio: 'inherit' })

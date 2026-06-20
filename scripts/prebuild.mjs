import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'

loadEnv()

const schemaPath = resolve('.codegen/schema.ts')

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
const token = process.env.SCHEMA_ACCESS_TOKEN?.trim()

if (!url || !token) {
  console.error(
    [
      '[prebuild] Missing required environment variables.',
      'Set NEXT_PUBLIC_GRAPHQL_URL and SCHEMA_ACCESS_TOKEN (e.g. in .env or on Vercel).',
    ].join('\n'),
  )
  process.exit(1)
}

console.log('[prebuild] Fetching GraphQL schema…')
execSync('bun run exports-gen', { stdio: 'inherit' })
execSync('bun run codegen', { stdio: 'inherit' })

if (!existsSync(schemaPath)) {
  console.error(
    `[prebuild] Codegen finished but ${schemaPath} was not created.`,
  )
  process.exit(1)
}

console.log(`[prebuild] Schema ready at ${schemaPath}`)

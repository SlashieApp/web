import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'

loadEnv()

const schemaPath = resolve('.codegen/schema.ts')

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
const token = process.env.SCHEMA_ACCESS_TOKEN?.trim()

if (!url || !token) {
  console.error(
    [
      '[ensure-codegen] Missing required environment variables.',
      'Set NEXT_PUBLIC_GRAPHQL_URL and SCHEMA_ACCESS_TOKEN (e.g. in .env or on Vercel).',
    ].join('\n'),
  )
  process.exit(1)
}

mkdirSync(resolve('.codegen'), { recursive: true })

console.log('[ensure-codegen] Fetching GraphQL schema…')
execSync('npx graphql-codegen --config codegen.ts', {
  stdio: 'inherit',
  env: process.env,
})

if (!existsSync(schemaPath)) {
  console.error(
    `[ensure-codegen] Codegen finished but ${schemaPath} was not created.`,
  )
  process.exit(1)
}

console.log(`[ensure-codegen] Schema ready at ${schemaPath}`)

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'

loadEnv()

const schemaPath = resolve('.codegen/schema.ts')
const MAX_ATTEMPTS = 4
const RETRY_DELAYS_MS = [4000, 8000, 16000]

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

function sleep(ms) {
  execSync(`sleep ${Math.ceil(ms / 1000)}`)
}

mkdirSync(resolve('.codegen'), { recursive: true })

let lastError = null
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  console.log(
    `[ensure-codegen] Fetching GraphQL schema (attempt ${attempt}/${MAX_ATTEMPTS})…`,
  )
  try {
    execSync('npx graphql-codegen --config codegen.ts', {
      stdio: 'inherit',
      env: process.env,
    })
    lastError = null
    break
  } catch (error) {
    lastError = error
    const delay = RETRY_DELAYS_MS[attempt - 1]
    if (!delay) break
    console.warn(
      `[ensure-codegen] Codegen failed; retrying in ${delay / 1000}s (cold schema host or CSRF).`,
    )
    sleep(delay)
  }
}

if (lastError) {
  console.error('[ensure-codegen] Codegen failed after retries.')
  process.exit(1)
}

if (!existsSync(schemaPath)) {
  console.error(
    `[ensure-codegen] Codegen finished but ${schemaPath} was not created.`,
  )
  process.exit(1)
}

console.log(`[ensure-codegen] Schema ready at ${schemaPath}`)

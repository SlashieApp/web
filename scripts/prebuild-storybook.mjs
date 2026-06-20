import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const schemaDir = '.codegen'
const schemaPath = resolve(schemaDir, 'schema.ts')
const stubPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/storybook/codegenSchemaStub.ts',
)

function useSchemaStub(reason) {
  mkdirSync(schemaDir, { recursive: true })
  copyFileSync(stubPath, schemaPath)
  console.warn(
    `[prebuild-storybook] ${reason} Using enum stub at ${schemaPath}.`,
  )
}

const url = process.env.NEXT_PUBLIC_GRAPHQL_URL
const token = process.env.SCHEMA_ACCESS_TOKEN

if (!url || !token) {
  useSchemaStub('Codegen env vars missing;')
  process.exit(0)
}

if (existsSync(schemaPath)) {
  console.warn(
    '[prebuild-storybook] .codegen/schema.ts already present; skipping codegen.',
  )
  process.exit(0)
}

try {
  execSync('graphql-codegen --config codegen.ts', { stdio: 'inherit' })
} catch {
  useSchemaStub('Codegen failed;')
  process.exit(0)
}

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const schemaPath = resolve('.codegen/schema.ts')
const outPath = resolve('src/storybook/codegenSchemaStub.ts')

if (!existsSync(schemaPath)) {
  console.error(
    '[extract-schema-enums] Missing .codegen/schema.ts — run `bun run codegen` first.',
  )
  process.exit(1)
}

const src = readFileSync(schemaPath, 'utf8')
const enums = [...src.matchAll(/^export enum \w+ \{[\s\S]*?\n\}/gm)].map(
  (match) => match[0],
)

if (enums.length === 0) {
  console.error('[extract-schema-enums] No enums found in schema.')
  process.exit(1)
}

const out = [
  '/**',
  ' * Runtime GraphQL enums for Storybook when `.codegen/schema.ts` is absent.',
  ' * Regenerate: `bun run codegen && node scripts/extract-schema-enums.mjs`',
  ' */',
  '',
  ...enums,
  '',
].join('\n')

writeFileSync(outPath, out)
console.log(`[extract-schema-enums] Wrote ${enums.length} enums to ${outPath}`)

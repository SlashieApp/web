import 'dotenv/config'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  // Use the checked-in schema to keep codegen deterministic in cloud CI/dev.
  schema: ['schema.graphql'],
  documents: ['src/graphql/**/*.ts', 'src/app/**/page.tsx'],
  ignoreNoDocuments: true,
  generates: {
    '.codegen/schema.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        useTypeImports: true,
        skipTypename: true,
      },
    },
  },
}

export default config

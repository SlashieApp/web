import 'dotenv/config'
import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaUrl = `${process.env.NEXT_PUBLIC_GRAPHQL_URL}/schema`
const config: CodegenConfig = {
  schema: [
    {
      [schemaUrl]: {
        headers: {
          'X-Schema-Token': process.env.SCHEMA_ACCESS_TOKEN || '',
          // Apollo CSRF: custom headers already trigger preflight; this keeps
          // GET /schema accepted when the API enforces apollo-require-preflight.
          'apollo-require-preflight': 'true',
        },
        handleAsSDL: true,
      },
    },
  ],
  documents: ['src/**/*.gql', 'src/app/**/page.tsx'],
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

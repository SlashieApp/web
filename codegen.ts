import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  'https://handyman-apollo.onrender.com/graphql'

const config: CodegenConfig = {
  schema: schemaUrl,
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

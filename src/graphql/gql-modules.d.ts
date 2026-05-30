/**
 * Ambient typing for raw GraphQL document imports.
 *
 * Each `.gql` file holds exactly one operation and is loaded at build time by
 * `graphql-tag/loader` (Turbopack) and `vite-plugin-graphql-loader` (Storybook
 * / Vitest). Both expose the parsed operation as the default export, so a
 * single-operation file resolves to one `DocumentNode`.
 */
declare module '*.gql' {
  import type { DocumentNode } from 'graphql'

  const doc: DocumentNode
  export default doc
}

declare module '*.graphql' {
  import type { DocumentNode } from 'graphql'

  const doc: DocumentNode
  export default doc
}

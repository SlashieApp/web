import type { DocumentNode } from 'graphql'
import { print } from 'graphql'

/** Next.js `fetch` cache config (e.g. dynamic route data). */
export type GraphqlNextConfig = {
  revalidate?: number | false
  tags?: string[]
}

export type GraphqlFetchOptions = {
  query: DocumentNode | string
  variables?: Record<string, unknown>
  /**
   * Optional bearer token (e.g. raw value from the `auth` cookie).
   * When set, sends `Authorization: Bearer …` (value is URI-decoded like the client Apollo link).
   */
  authToken?: string | null
  /** Passed to `fetch` as `next`. Defaults to `{ revalidate: 0 }` (always fresh). */
  next?: GraphqlNextConfig
}

export type GraphqlResponse<TData> = {
  data?: TData
  errors?: unknown
}

function graphqlEndpointUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
  if (!base) return null
  return `${base.replace(/\/$/, '')}/graphql`
}

/**
 * POST a GraphQL operation from Server Components, Route Handlers, or `generateMetadata`.
 * Mirrors the HTTP endpoint used by `apolloClient` (`NEXT_PUBLIC_GRAPHQL_URL` + `/graphql`).
 */
export async function fetch<TData = unknown>(
  options: GraphqlFetchOptions,
): Promise<GraphqlResponse<TData> | null> {
  const url = graphqlEndpointUrl()
  if (!url) return null

  const { query, variables, authToken, next = { revalidate: 0 } } = options

  const queryString = typeof query === 'string' ? query : print(query)
  const rawToken = authToken?.trim() ?? ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (rawToken) {
    headers.authorization = `Bearer ${decodeURIComponent(rawToken)}`
  }

  const response = await globalThis.fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: queryString, variables }),
    next,
  })

  if (!response.ok) return null
  return (await response.json()) as GraphqlResponse<TData>
}

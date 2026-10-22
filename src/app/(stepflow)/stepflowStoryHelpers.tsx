import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import type { Decorator } from '@storybook/nextjs-vite'
import { NEVER, throwError } from 'rxjs'

/**
 * Story-only helpers shared by the step-flow stories (create task, quote,
 * review, worker setup). Nothing here ships: it is only imported by
 * `*.stories.tsx` and the story fixtures next to them.
 */

/** Solid placeholder picture as a data URI, so stories never fetch images. */
export function storyImage(color: string, size = 200): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${color}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * A real HEIC photo (240 x 160, four coloured quarters), the one the HEIC
 * converter's browser test uses. Chromium can't decode HEIC, so picking it
 * in a story runs the conversion.
 */
export async function storyHeicPhoto(name = 'IMG_0001.HEIC'): Promise<File> {
  const url = new URL('../../utils/heicPhoto.fixture.heic', import.meta.url)
  const bytes = await (await fetch(url)).arrayBuffer()
  return new File([bytes], name, { type: 'image/heic' })
}

/** A date inside the picker's year-long window, as `YYYY-MM-DD`. */
export function storyDateInDays(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Story-only Apollo client. The `.env` API is production, so requests never
 * leave the browser: they hang forever, or fail on purpose with `failWith`.
 * Seed `cache` for the queries a story needs.
 */
export function createStoryApolloClient({
  cache = new InMemoryCache(),
  failWith,
}: { cache?: InMemoryCache; failWith?: string } = {}) {
  return new ApolloClient({
    cache,
    link: new ApolloLink(() =>
      failWith ? throwError(() => new Error(failWith)) : NEVER,
    ),
  })
}

/** Replaces the preview's real Apollo client with a story-only one. */
export function withStoryApollo(client: ApolloClient): Decorator {
  return (Story) => (
    <ApolloProvider client={client}>
      <Story />
    </ApolloProvider>
  )
}

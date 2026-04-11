'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'

/**
 * Aligns Emotion SSR with the client so Chakra’s `<Global />` styles do not
 * reorder vs. component markup (React 19 / App Router hydration).
 * @see https://github.com/chakra-ui/chakra-ui/discussions/9051
 * @see https://nextjs.org/docs/app/guides/css-in-js
 */
export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: 'chakra', prepend: true })
    emotionCache.compat = true
    const prevInsert = emotionCache.insert.bind(emotionCache)
    let inserted: string[] = []
    emotionCache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1] as { name?: string } | undefined
      const name = serialized?.name
      if (name !== undefined && emotionCache.inserted[name] === undefined) {
        inserted.push(name)
      }
      return prevInsert(...args)
    }
    const flushInserted = () => {
      const prev = inserted
      inserted = []
      return prev
    }
    return { cache: emotionCache, flush: flushInserted }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null
    let styles = ''
    for (const name of names) {
      const rule = cache.inserted[name]
      if (typeof rule === 'string') {
        styles += rule
      }
    }
    if (!styles) return null
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion SSR extraction per Next.js CSS-in-JS guide
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

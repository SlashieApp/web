'use client'

import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useEffect } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { clearAuthToken } from '@/utils/auth'

import { headerMeWorker, seedHeaderMeStore } from './headerStoryFixtures'

function HeaderStorySeed({
  me,
  children,
}: {
  me: MeSnapshot | null
  children: ReactNode
}) {
  useEffect(() => {
    clearAuthToken()
    seedHeaderMeStore(me)

    return () => {
      clearAuthToken()
      seedHeaderMeStore(null)
    }
  }, [me])

  return children
}

/** Seed Zustand auth state for header stories. Apollo is provided globally in Storybook preview. */
export function withHeaderStory(
  me: MeSnapshot | null = headerMeWorker,
): Decorator {
  return (Story) => (
    <HeaderStorySeed me={me}>
      <Story />
    </HeaderStorySeed>
  )
}

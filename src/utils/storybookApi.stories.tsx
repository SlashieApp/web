import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import Me from '@/graphql/Me.gql'
import { apolloClient } from '@/utils/apolloClient'

/**
 * Guard (FE-551): Storybook, its tests and ui.slashie.app never talk to a
 * real API. The address is set in `.storybook/main.ts`; this fails if that
 * ever stops applying.
 */
const meta = {
  title: 'Internals/Storybook API guard',
  render: () => (
    <Text fontSize="sm">
      API address in Storybook: {process.env.NEXT_PUBLIC_GRAPHQL_URL}
    </Text>
  ),
} satisfies Meta

export default meta

export const NoRealApi: StoryObj<typeof meta> = {
  play: async () => {
    const url = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? ''
    await expect(url).toBe('http://127.0.0.1:9')
    await expect(url).not.toContain('slashie.app')
    await expect(process.env.NEXT_PUBLIC_STORYBOOK).toBe('true')

    // The app's own client fails at once, on this machine, and the page stays put.
    const here = window.location.href
    const started = Date.now()
    await expect(
      apolloClient.query({ query: Me, fetchPolicy: 'network-only' }),
    ).rejects.toThrow()
    await expect(Date.now() - started).toBeLessThan(5000)
    await new Promise((resolve) => setTimeout(resolve, 200))
    await expect(window.location.href).toBe(here)
  },
}

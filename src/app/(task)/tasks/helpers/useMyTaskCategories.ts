'use client'

import { useQuery } from '@apollo/client/react'

import { useUserStore } from '@/app/(auth)/store/user'
import type { MyTaskCategoriesQuery } from '@codegen/schema'

import MyTaskCategories from '../graphql/MyTaskCategories.gql'

const NO_CATEGORIES: string[] = []

/**
 * `me.hubTaskCategories` for the My Tasks Category filter. The API keeps them
 * unfiltered, so the choices do not shrink while search or other filters
 * change.
 */
export function useMyTaskCategories() {
  const me = useUserStore((state) => state.me)
  const { data, refetch } = useQuery<MyTaskCategoriesQuery>(MyTaskCategories, {
    skip: !me,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  })

  return {
    hubTaskCategories: data?.me?.hubTaskCategories ?? NO_CATEGORIES,
    refetch,
  }
}

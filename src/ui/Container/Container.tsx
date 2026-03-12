'use client'

import {
  Container as ChakraContainer,
  type ContainerProps,
} from '@chakra-ui/react'

export type ContainerComponentProps = ContainerProps

export function Container(props: ContainerComponentProps) {
  return (
    <ChakraContainer maxW="6xl" px={{ base: 4, md: 6 }} mx="auto" {...props} />
  )
}

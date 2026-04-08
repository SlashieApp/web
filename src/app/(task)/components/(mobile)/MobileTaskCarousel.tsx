'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useEffect, useRef } from 'react'

import { Button, Heading, Text } from '@ui'

type MobileTaskCard = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  badgeText?: string
}

export type MobileTaskCarouselProps = {
  tasks: MobileTaskCard[]
  selectedTaskId: string | null
  onSelectTask: (taskId: string) => void
}

export function MobileTaskCarousel({
  tasks,
  selectedTaskId,
  onSelectTask,
}: MobileTaskCarouselProps) {
  const cardRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())

  useEffect(() => {
    if (!selectedTaskId) return
    const node = cardRefs.current.get(selectedTaskId)
    if (!node) return
    node.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    })
  }, [selectedTaskId])

  if (tasks.length === 0) {
    return (
      <Box
        bg="surfaceContainerLowest/96"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        boxShadow="0 8px 24px rgba(15,23,42,0.2)"
        px={4}
        py={3}
      >
        <Text fontSize="sm" color="muted">
          No tasks match current filters.
        </Text>
      </Box>
    )
  }

  return (
    <HStack
      gap={3}
      overflowX="auto"
      overflowY="hidden"
      align="stretch"
      pl={0}
      pr={4}
      pb={1}
      css={{
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      {tasks.map((task) => {
        const active = selectedTaskId === task.id
        return (
          <Box
            as="button"
            key={task.id}
            type="button"
            textAlign="left"
            ref={(node: HTMLButtonElement | null) => {
              if (node) cardRefs.current.set(task.id, node)
              else cardRefs.current.delete(task.id)
            }}
            onClick={() => onSelectTask(task.id)}
            minW="calc(100% - 44px)"
            maxW="calc(100% - 44px)"
            scrollSnapAlign="start"
            bg="surfaceContainerLowest/97"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={active ? 'primary.500' : 'border'}
            boxShadow="0 10px 30px rgba(15,23,42,0.22)"
            px={4}
            py={3}
          >
            <Stack gap={2.5}>
              <HStack justify="space-between" align="flex-start" gap={2}>
                {task.badgeText ? (
                  <Text
                    fontSize="2xs"
                    fontWeight={800}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    bg="secondaryFixed"
                    color="onSecondaryFixed"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {task.badgeText}
                  </Text>
                ) : (
                  <Box />
                )}
                <Text fontSize="xl" fontWeight={800} color="primary.700">
                  {task.priceLabel}
                </Text>
              </HStack>

              <Stack gap={1}>
                <Heading size="sm" color="fg">
                  {task.title}
                </Heading>
                <Text fontSize="sm" color="muted" lineClamp={2}>
                  {task.description}
                </Text>
              </Stack>

              <Text fontSize="xs" color="muted">
                {task.location}
              </Text>

              <Button
                as={NextLink}
                href={`/task/${task.id}`}
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                View details
              </Button>
            </Stack>
          </Box>
        )
      })}
    </HStack>
  )
}

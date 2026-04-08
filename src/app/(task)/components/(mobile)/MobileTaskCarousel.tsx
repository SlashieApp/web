'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures'
import NextLink from 'next/link'
import { useEffect } from 'react'

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
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', containScroll: 'trimSnaps', dragFree: false },
    [WheelGesturesPlugin()],
  )

  useEffect(() => {
    if (!emblaApi || !selectedTaskId) return
    const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId)
    if (selectedIndex < 0) return
    emblaApi.scrollTo(selectedIndex)
  }, [emblaApi, selectedTaskId, tasks])

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
    <Box ref={emblaRef} overflow="hidden" px={3} pb={20} mb={1}>
      <HStack
        gap={3}
        align="stretch"
        css={{
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {tasks.map((task) => {
          const active = selectedTaskId === task.id
          return (
            <Box
              as="button"
              key={task.id}
              textAlign="left"
              onClick={() => onSelectTask(task.id)}
              flex="0 0 calc(100% - 52px)"
              maxW="calc(100% - 52px)"
              minW="0"
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
    </Box>
  )
}

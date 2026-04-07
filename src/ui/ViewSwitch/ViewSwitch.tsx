'use client'

import { HStack } from '@chakra-ui/react'

import { Button } from '../Button'

export type TaskBrowseMapView = 'list' | 'map'

export type ViewSwitchProps = {
  value: TaskBrowseMapView
  onChange: (next: TaskBrowseMapView) => void
  listLabel?: string
  mapLabel?: string
}

export function ViewSwitch({
  value,
  onChange,
  listLabel = 'List',
  mapLabel = 'Map',
}: ViewSwitchProps) {
  return (
    <HStack
      position="absolute"
      zIndex={3}
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      gap={2}
      bg="surfaceContainerLowest"
      borderRadius="full"
      boxShadow="0 4px 24px rgba(15,23,42,0.15)"
      borderWidth="1px"
      borderColor="border"
      p={1}
    >
      <Button
        type="button"
        size="sm"
        variant={value === 'list' ? 'solid' : 'subtle'}
        borderRadius="full"
        px={5}
        onClick={() => onChange('list')}
      >
        {listLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === 'map' ? 'solid' : 'subtle'}
        borderRadius="full"
        px={5}
        onClick={() => onChange('map')}
      >
        {mapLabel}
      </Button>
    </HStack>
  )
}

'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'
import { LuCheck, LuSearch, LuX } from 'react-icons/lu'

import { Button, Card, IconButton, Input as UiInput } from '@ui'

import { useTaskBrowseLayout } from '../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'

/**
 * Worker-mode filter card (mirrors the task filter panel shell): worker
 * search text + verified-only toggle, applied via the same draft → submitted
 * pattern. The shared area/radius controls stay on the location bar and map.
 */
export function WorkerFiltersPanel() {
  const {
    workerSearchInput,
    setWorkerSearchInput,
    verifiedOnly,
    setVerifiedOnly,
    submitWorkerFilters,
  } = useWorkerSearch()
  const { setIsFilterOpen } = useTaskBrowseLayout()

  const submitAndDismiss = () => {
    submitWorkerFilters()
    setIsFilterOpen(false)
  }

  return (
    <Card
      position="relative"
      w="full"
      maxW="full"
      p={{ base: 3, md: 4 }}
      boxShadow="ghostBorder"
      pointerEvents="auto"
    >
      <Box position="absolute" top={2} right={2} zIndex={1}>
        <IconButton
          type="button"
          variant="ghost"
          aria-label="Close filters"
          onClick={() => setIsFilterOpen(false)}
        >
          <LuX size={18} strokeWidth={2} />
        </IconButton>
      </Box>

      <Stack gap={6} pt={1}>
        <Stack gap={3}>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            color="text.muted"
            textTransform="uppercase"
          >
            Search workers
          </Text>
          <UiInput
            startElement={
              <Box as="span" aria-hidden display="inline-flex">
                <LuSearch size={18} strokeWidth={2} />
              </Box>
            }
            value={workerSearchInput}
            placeholder="Name, skill, or tagline"
            type="search"
            inputMode="search"
            autoComplete="off"
            aria-label="Search workers"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWorkerSearchInput(e.target.value)
            }
          />
        </Stack>

        <Stack gap={3}>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            color="text.muted"
            textTransform="uppercase"
          >
            Verification
          </Text>
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant={verifiedOnly ? 'primary' : 'secondary'}
              borderRadius="full"
              aria-pressed={verifiedOnly}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
            >
              {verifiedOnly ? (
                <Box as="span" display="inline-flex" aria-hidden>
                  <LuCheck size={14} strokeWidth={3} />
                </Box>
              ) : null}
              Verified only
            </Button>
          </HStack>
        </Stack>

        <Button
          type="button"
          w="full"
          variant="primary"
          onClick={submitAndDismiss}
        >
          Apply filters
        </Button>
      </Stack>
    </Card>
  )
}

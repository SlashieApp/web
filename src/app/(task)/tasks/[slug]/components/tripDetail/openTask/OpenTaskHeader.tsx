'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import {
  LuArrowLeft,
  LuEllipsisVertical,
  LuFlag,
  LuMessageSquare,
  LuShare2,
} from 'react-icons/lu'

import { showAppToast } from '@/utils/appToast'
import {
  Badge,
  Button,
  Dropdown,
  IconButton,
  Link,
  StatusPill,
  useDropdownClose,
} from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { Reveal } from '../Reveal'
import { selectStatusHeaderCopy } from '../statusHeaderCopy'
import { useShareTask } from './shareTask'

function OverflowMenu({ onShare }: { onShare: () => void }) {
  const close = useDropdownClose()
  return (
    <Stack gap={1} p={1} minW="200px">
      <Button
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={() => {
          close()
          onShare()
        }}
      >
        <LuShare2 />
        Share task
      </Button>
      <Button
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={() => {
          close()
          showAppToast({
            title: 'Report received',
            description: 'Thanks — our safety team will review this task.',
            type: 'info',
          })
        }}
      >
        <LuFlag />
        Report task
      </Button>
    </Stack>
  )
}

/**
 * Open-task header: a back link + overflow (desktop), then the status pill, a
 * quote-count chip, and the state headline/subtext. Back target and chip copy
 * flip by viewer (owner vs worker/visitor).
 */
export function OpenTaskHeader() {
  const { task, myQuote, isAuthenticated, permissions } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || 'Task')
  if (!task) return null

  const isOwner = permissions.isOwner
  const quoteCount = task.quotes.length
  const copy = selectStatusHeaderCopy({
    permissions,
    myQuote,
    isAuthenticated,
    task,
  })

  const backHref = isOwner ? '/requests' : '/tasks'
  const backLabel = isOwner ? 'Back to my tasks' : 'Back to discovery'
  const plural = quoteCount === 1 ? 'quote' : 'quotes'
  const chipText = isOwner
    ? `${quoteCount} ${plural} so far`
    : quoteCount === 0
      ? 'Be the first to quote'
      : `${quoteCount} ${plural}`

  return (
    <Stack gap={5} w="full">
      <HStack
        justify="space-between"
        align="center"
        display={{ base: 'none', lg: 'flex' }}
      >
        <Link
          href={backHref}
          color="text.link"
          fontWeight={600}
          _hover={{ textDecoration: 'none' }}
        >
          <HStack gap={1.5} align="center">
            <LuArrowLeft />
            <span>{backLabel}</span>
          </HStack>
        </Link>
        <Dropdown
          contentLabel="Task options"
          align="end"
          trigger={
            <IconButton type="button" variant="ghost" aria-label="Task options">
              <LuEllipsisVertical />
            </IconButton>
          }
        >
          <OverflowMenu onShare={() => void onShare()} />
        </Dropdown>
      </HStack>

      <Reveal speed="slow">
        <Stack gap={3} w="full">
          <HStack
            justify="space-between"
            align="center"
            gap={3}
            flexWrap="wrap"
          >
            <StatusPill status={copy.pill} size="lg" />
            {permissions.isOpen ? (
              <Badge variant="neutral" shape="pill" size="lg">
                {chipText}
                <LuMessageSquare aria-hidden />
              </Badge>
            ) : null}
          </HStack>
          <Stack gap={2}>
            <Heading
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '24px', md: '28px' }}
              fontWeight={600}
              lineHeight="1.2"
              color="text.default"
            >
              {copy.headline}
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="text.muted">
              {copy.subtext}
            </Text>
          </Stack>
        </Stack>
      </Reveal>
    </Stack>
  )
}

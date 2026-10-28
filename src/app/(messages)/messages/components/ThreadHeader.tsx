'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { ThreadFieldsFragment } from '@codegen/schema'
import { type ReactNode, useState } from 'react'
import { LuArrowLeft, LuEllipsis } from 'react-icons/lu'

import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '@/app/(task)/tasks/[slug]/components/overview/OrderRequestDialogs'
import {
  CancelTaskDialog,
  WithdrawQuoteDialog,
} from '@/app/(task)/tasks/[slug]/components/overview/TaskConfirmDialogs'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { ReportControl } from '@/content/trust/ReportControl'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  Avatar,
  Button,
  Dropdown,
  IconButton,
  Link,
  useDropdownClose,
} from '@ui'

import { threadMenuActions } from '../helpers/messagesFormat'
import { threadTitle } from '../helpers/messagesThread'
import bag from '../i11n.json'
import { ThreadPin } from './ThreadPin'

type HeaderProps = {
  thread: ThreadFieldsFragment
  onToggleBlock: () => void
}

function MenuItem({
  label,
  onSelect,
  danger = false,
}: {
  label: string
  onSelect: () => void
  danger?: boolean
}) {
  const close = useDropdownClose()
  return (
    <Button
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      color={danger ? 'status.danger.fg' : undefined}
      onClick={() => {
        close()
        onSelect()
      }}
    >
      {label}
    </Button>
  )
}

function ThreadMenu({ children }: { children: ReactNode }) {
  const t = useI11n(bag)
  return (
    <Dropdown
      contentLabel={t.threadMenu}
      align="end"
      width="240px"
      trigger={
        <IconButton variant="ghost" aria-label={t.threadMenu}>
          <LuEllipsis aria-hidden />
        </IconButton>
      }
    >
      {children}
    </Dropdown>
  )
}

function BlockItem({ thread, onToggleBlock }: HeaderProps) {
  const t = useI11n(bag)
  const party = thread.otherParty
  if (!party || party.deleted) return null
  return (
    <MenuItem
      label={formatMessage(thread.blockedByMe ? t.unblock : t.block, {
        name: party.name,
      })}
      onSelect={onToggleBlock}
    />
  )
}

/**
 * One Report per conversation (FE-267): the task, or for the poster the other
 * person (reporting your own task makes no sense).
 */
function ReportItem({
  thread,
  isOwner,
  taskId,
  taskTitle,
}: {
  thread: ThreadFieldsFragment
  isOwner: boolean
  taskId: string
  taskTitle: string
}) {
  const close = useDropdownClose()
  const party = thread.otherParty
  if (!isOwner) {
    return (
      <ReportControl
        kind="task"
        targetId={taskId}
        targetTitle={taskTitle}
        variant="menu"
        onOpened={close}
      />
    )
  }
  if (!party || party.deleted) return null
  return (
    <ReportControl
      kind="user"
      targetId={party.userId}
      targetTitle={party.name}
      variant="menu"
      onOpened={close}
    />
  )
}

/**
 * Task thread menu (FE-272): the viewer's real quote / booking actions, then
 * one Report for the conversation (FE-267) and Block. Runs inside the task's
 * detail context, so the actions share task detail's rules and dialogs.
 */
function TaskThreadMenu({ thread, onToggleBlock }: HeaderProps) {
  const t = useI11n(bag)
  const m = t.menu
  const { task, permissions } = useTaskDetail()
  const booking = useOrderRequestOptions()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [withdrawQuoteOpen, setWithdrawQuoteOpen] = useState(false)
  const [cancelTaskOpen, setCancelTaskOpen] = useState(false)

  if (!task) return null
  const actions = threadMenuActions({
    hasPendingQuote: permissions.canWithdrawQuote,
    canCancelTask: permissions.canCancelTask,
    booking,
    frozen: permissions.isFrozen,
  })

  return (
    <>
      <ThreadMenu>
        {actions.map((action) => (
          <MenuItem
            key={action}
            label={m[action]}
            danger={action !== 'reschedule'}
            onSelect={() => {
              if (action === 'withdrawQuote') setWithdrawQuoteOpen(true)
              else if (action === 'cancelTask') setCancelTaskOpen(true)
              else if (action === 'reschedule') setRescheduleOpen(true)
              else setCancelOpen(true)
            }}
          />
        ))}
        <ReportItem
          thread={thread}
          isOwner={permissions.isOwner}
          taskId={task.id}
          taskTitle={task.title}
        />
        <BlockItem thread={thread} onToggleBlock={onToggleBlock} />
      </ThreadMenu>
      <WithdrawQuoteDialog
        open={withdrawQuoteOpen}
        onOpenChange={setWithdrawQuoteOpen}
      />
      <CancelTaskDialog
        open={cancelTaskOpen}
        onOpenChange={setCancelTaskOpen}
      />
      {booking ? (
        <>
          <OrderRescheduleDialog
            open={rescheduleOpen}
            onOpenChange={setRescheduleOpen}
            counterpartName={booking.counterpartName}
          />
          <OrderCancelDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            counterpartName={booking.counterpartName}
          />
        </>
      ) : null}
    </>
  )
}

/** Errors from menu actions; task detail shows these on its own page. */
function TaskActionError() {
  const { quoteError, cancelError, jobActionError } = useTaskDetail()
  const error = quoteError || cancelError || jobActionError
  if (!error) return null
  return (
    <Text
      role="alert"
      px={{ base: 4, lg: 5 }}
      py={2}
      fontSize="sm"
      color="status.danger.fg"
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      {error}
    </Text>
  )
}

/** The title (a link to their profile when it names one person) over the task. */
function HeaderTitle({ thread }: { thread: ThreadFieldsFragment }) {
  const t = useI11n(bag)
  const party = thread.otherParty
  const title = threadTitle(thread, t)
  const heading = (
    <Heading as="h2" fontSize="md" letterSpacing="0" lineClamp={1}>
      {title}
    </Heading>
  )
  return (
    <Stack gap={0} flex={1} minW={0}>
      {party && !party.deleted ? (
        <Link
          href={publicProfilePath(party.userId)}
          aria-label={formatMessage(t.viewProfile, { name: party.name })}
          display="block"
          alignSelf="flex-start"
          maxW="full"
          color="text.default"
          borderRadius="md"
          _hover={{ textDecoration: 'none', opacity: 0.8 }}
        >
          {heading}
        </Link>
      ) : (
        heading
      )}
      {thread.task ? (
        <Link
          href={`/tasks/${thread.task.id}`}
          aria-label={formatMessage(t.openTask, { title: thread.task.title })}
          display="block"
          alignSelf="flex-start"
          maxW="full"
          fontSize="xs"
          color="text.muted"
          borderRadius="md"
        >
          <Text as="span" lineClamp={1}>
            {thread.task.title}
          </Text>
        </Link>
      ) : (
        <Text fontSize="xs" color="text.muted" lineClamp={1}>
          {t.systemSubtitle}
        </Text>
      )}
    </Stack>
  )
}

function HeaderBar({
  thread,
  menu,
}: {
  thread: ThreadFieldsFragment
  menu: ReactNode
}) {
  const t = useI11n(bag)
  const party = thread.otherParty
  return (
    <HStack
      gap={2}
      px={{ base: 2, lg: 4 }}
      py={2.5}
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <IconButton
        asChild
        variant="ghost"
        aria-label={t.back}
        display={{ base: 'inline-flex', lg: 'none' }}
      >
        <Link href="/messages">
          <LuArrowLeft aria-hidden />
        </Link>
      </IconButton>
      {party ? (
        <Avatar
          name={party.name}
          src={party.deleted ? undefined : (party.avatarUrl ?? undefined)}
          size="sm"
        />
      ) : null}
      <HeaderTitle thread={thread} />
      {menu}
    </HStack>
  )
}

/**
 * Thread header (Thread screen v2): the other person's name (their profile)
 * or, for the poster before booking, how many workers quoted; the task name
 * under it (the task); and the menu. Task threads render inside the thread's
 * `TaskDetailProvider`, so the menu and the top pin match task detail;
 * Slashie threads only offer Block.
 */
export function ThreadHeader({ thread, onToggleBlock }: HeaderProps) {
  if (!thread.task) {
    const canBlock = Boolean(thread.otherParty && !thread.otherParty.deleted)
    return (
      <HeaderBar
        thread={thread}
        menu={
          canBlock ? (
            <ThreadMenu>
              <BlockItem thread={thread} onToggleBlock={onToggleBlock} />
            </ThreadMenu>
          ) : null
        }
      />
    )
  }
  return (
    <>
      <HeaderBar
        thread={thread}
        menu={<TaskThreadMenu thread={thread} onToggleBlock={onToggleBlock} />}
      />
      <ThreadPin attention={thread.attention} />
      <TaskActionError />
    </>
  )
}

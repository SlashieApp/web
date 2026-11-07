'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { FormStack, Link, Modal, RadioButton } from '@ui'

import { createTaskAskingHref } from './askWorkerParam'
import bag from './i11n.json'
import type { AskableTaskChoice } from './types'

export type AskToQuoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The worker's first name, as the profile's button shows it. */
  workerName: string
  /** For the "Post a new task" link, which carries the worker. */
  workerUserId: string
  /** The viewer's open tasks, newest first. */
  tasks: readonly AskableTaskChoice[]
  /** Sends the invitation for the picked task; true once it went through. */
  onSubmit: (task: AskableTaskChoice) => Promise<boolean>
  submitting?: boolean
  /** The refusal, in the dialog; it stays open. */
  error?: string | null
}

/**
 * The chooser (FE-507): one of the viewer's open tasks to ask a worker about.
 * A row that can't be picked says why ("Asked" or "Not available"). The main
 * button stays off until a task is picked and sends only on that tap.
 */
export function AskToQuoteDialog({
  open,
  onOpenChange,
  workerName,
  workerUserId,
  tasks,
  onSubmit,
  submitting = false,
  error = null,
}: AskToQuoteDialogProps) {
  const t = useI11n(bag)
  const [pickedId, setPickedId] = useState<string | null>(null)
  const picked = tasks.find((task) => task.id === pickedId && task.canAsk)
  const vars = { name: workerName }

  const quotesLabel = (count: number) =>
    count === 0
      ? t.dialog.quotesNone
      : count === 1
        ? t.dialog.quotesOne
        : formatMessage(t.dialog.quotesMany, { count })

  const handleSubmit = async () => {
    if (!picked || submitting) return
    const ok = await onSubmit(picked)
    if (ok) {
      setPickedId(null)
      onOpenChange(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) setPickedId(null)
        onOpenChange(next)
      }}
      title={formatMessage(t.dialog.title, vars)}
      description={formatMessage(t.dialog.description, vars)}
      cancelLabel={t.dialog.cancel}
      submitLabel={formatMessage(t.dialog.submit, vars)}
      submitLoading={submitting}
      submitDisabled={!picked || submitting}
      onSubmit={() => void handleSubmit()}
    >
      <FormStack>
        <Stack
          role="radiogroup"
          aria-label={t.dialog.listLabel}
          gap="form.alternativesGap"
        >
          {tasks.map((task) => (
            <RadioButton
              key={task.id}
              role="radio"
              checked={task.id === pickedId && task.canAsk}
              disabled={!task.canAsk}
              onChange={() => setPickedId(task.id)}
              label={
                <Box
                  as="span"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  w="full"
                >
                  <Stack as="span" gap={0.5} flex="1" minW={0}>
                    <Text as="span" lineClamp={2}>
                      {task.title}
                    </Text>
                    <Text
                      as="span"
                      fontSize="xs"
                      fontWeight={400}
                      color="text.muted"
                    >
                      {quotesLabel(task.quoteCount)}
                    </Text>
                  </Stack>
                  {task.canAsk ? null : (
                    <Text
                      as="span"
                      fontSize="xs"
                      fontWeight={500}
                      color="text.muted"
                      flexShrink={0}
                    >
                      {task.alreadyAsked
                        ? t.dialog.asked
                        : t.dialog.notAvailable}
                    </Text>
                  )}
                </Box>
              }
            />
          ))}
        </Stack>
        <Link href={createTaskAskingHref(workerUserId)} alignSelf="flex-start">
          {t.dialog.postNew}
        </Link>
        {error ? (
          <Text fontSize="sm" color="status.danger.fg" role="alert">
            {error}
          </Text>
        ) : null}
      </FormStack>
    </Modal>
  )
}

'use client'

import { Box, HStack, SimpleGrid, Stack, Text, Wrap } from '@chakra-ui/react'
import { WorkerPublishState } from '@codegen/schema'
import { LuBriefcaseBusiness, LuCircle } from 'react-icons/lu'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import { categoryLabelFromEnum } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import setupBag from '@/app/(stepflow)/worker/setup/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Link } from '@ui'

import {
  WORKER_TODO_COUNTS,
  type WorkerProfileTodo,
  workerProfileTodos,
} from '../../../helpers/workerProfileTodos'
import bag from '../../../i11n.json'
import type { ProfileViewConfig } from '../../../views'

export type WorkerProfileCardProps = {
  me: MeSnapshot
  variant: ProfileViewConfig['workerCard']
  /** Suspended: no editing or setup links. */
  readOnly?: boolean
  onEdit: () => void
  onEditPhoto: () => void
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={0} minW={0}>
      <Text fontSize="xs" color="text.muted">
        {label}
      </Text>
      <Text fontSize="sm" color="text.default" wordBreak="break-word">
        {value}
      </Text>
    </Stack>
  )
}

/** Headline, service, experience, area, bio and skills as customers see them. */
function WorkerFacts({ me }: { me: MeSnapshot }) {
  const t = useI11n(bag).worker
  const trades = useI11n(setupBag).trades
  const worker = me.worker
  if (!worker) return null
  const area =
    worker.preferredLocation?.name?.trim() || worker.locationAddress?.trim()

  return (
    <Stack gap={4}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Fact label={t.headline} value={worker.tagline?.trim() || t.notAdded} />
        <Fact
          label={t.primaryService}
          value={
            categoryLabelFromEnum(worker.primaryCategory, trades) ?? t.notAdded
          }
        />
        <Fact
          label={t.yearsExperience}
          value={
            typeof worker.yearsExperience === 'number'
              ? formatMessage(t.yearsValue, { years: worker.yearsExperience })
              : t.notAdded
          }
        />
        <Fact label={t.serviceArea} value={area || t.notAdded} />
      </SimpleGrid>
      {worker.bio?.trim() ? (
        <Fact label={t.bio} value={worker.bio.trim()} />
      ) : null}
      {worker.skills.length > 0 ? (
        <Stack gap={1.5}>
          <Text fontSize="xs" color="text.muted">
            {t.skills}
          </Text>
          <Wrap gap={2}>
            {worker.skills.map((skill) => (
              <Badge key={skill} variant="neutral" shape="pill">
                {skill}
              </Badge>
            ))}
          </Wrap>
        </Stack>
      ) : null}
    </Stack>
  )
}

/** What the worker could still add; each item opens the right editor. */
function WorkerTodos({
  todos,
  readOnly,
  onEdit,
  onEditPhoto,
}: {
  todos: readonly WorkerProfileTodo[]
  readOnly: boolean
  onEdit: () => void
  onEditPhoto: () => void
}) {
  const t = useI11n(bag).worker
  if (todos.length === 0) return null

  return (
    <Stack
      gap={1}
      pt={4}
      borderTopWidth="1px"
      borderColor="border.default"
      as="section"
      aria-label={t.todosTitle}
    >
      <Text fontSize="sm" fontWeight={700}>
        {t.todosTitle}
      </Text>
      {todos.map((todo) => {
        const label = formatMessage(t.todos[todo], {
          count: WORKER_TODO_COUNTS[todo] ?? '',
        })
        return readOnly ? (
          <Text key={todo} fontSize="sm" color="text.muted">
            {label}
          </Text>
        ) : (
          <Button
            key={todo}
            type="button"
            variant="ghost"
            size="sm"
            minH="44px"
            justifyContent="flex-start"
            px={2}
            ml={-2}
            fontWeight={500}
            onClick={todo === 'photo' ? onEditPhoto : onEdit}
          >
            <Box as="span" color="text.muted" display="inline-flex" aria-hidden>
              <LuCircle size={14} />
            </Box>
            {label}
          </Button>
        )
      })}
    </Stack>
  )
}

/**
 * The worker card, from the view: an invitation to become a worker, the
 * saved draft while setup is unfinished, or the live profile with Edit and
 * what's still worth adding.
 */
export function WorkerProfileCard({
  me,
  variant,
  readOnly = false,
  onEdit,
  onEditPhoto,
}: WorkerProfileCardProps) {
  const t = useI11n(bag).worker
  const icon = <LuBriefcaseBusiness size={18} aria-hidden />

  if (variant === 'empty') {
    return (
      <DashboardSectionCard
        id="worker-profile"
        title={t.title}
        description={t.emptyBody}
        icon={icon}
      >
        {readOnly ? null : (
          <Button asChild size="sm" minH="44px" alignSelf="flex-start">
            <Link
              href={workerSetupHref('/profile?section=worker')}
              _hover={{ textDecoration: 'none' }}
            >
              {t.becomeWorker}
            </Link>
          </Button>
        )}
      </DashboardSectionCard>
    )
  }

  const draft = variant === 'draft'
  const hidden = me.worker?.publishState === WorkerPublishState.Hidden

  return (
    <DashboardSectionCard
      id="worker-profile"
      title={t.title}
      description={draft ? t.draftBody : t.description}
      icon={icon}
      onEdit={draft || readOnly ? undefined : onEdit}
      editLabel={t.edit}
    >
      <Stack gap={4}>
        <HStack>
          <Badge
            variant={draft ? 'warning' : hidden ? 'neutral' : 'success'}
            dot
            shape="pill"
          >
            {draft ? t.notPublished : hidden ? t.hidden : t.published}
          </Badge>
        </HStack>
        <WorkerFacts me={me} />
        {draft ? null : (
          <WorkerTodos
            todos={workerProfileTodos(me)}
            readOnly={readOnly}
            onEdit={onEdit}
            onEditPhoto={onEditPhoto}
          />
        )}
      </Stack>
    </DashboardSectionCard>
  )
}

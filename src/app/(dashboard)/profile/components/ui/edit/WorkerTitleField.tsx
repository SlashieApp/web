'use client'

import { HStack } from '@chakra-ui/react'

import {
  WORKER_PRIMARY_CATEGORIES,
  type WorkerTradeSlug,
  type WorkerTradesCopy,
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { Badge, FormField, Link, Select } from '@ui'

import type bag from '../../../i11n.json'

type TitleCopy = (typeof bag)['en']['workerForm']['title']

/**
 * The worker's title (BE-130, a Slashie Pro feature): one of the setup
 * trades, shown with their name on their profile, quotes and Find workers.
 * Without Unlimited the field is locked, with the badge and a link to Pricing;
 * a title kept from an earlier membership shows here, locked, and is hidden
 * from everyone else until they have Unlimited again.
 */
export function WorkerTitleField({
  value,
  onChange,
  locked,
  trades,
  copy,
}: {
  /** A trade slug, or '' for no title. */
  value: WorkerTradeSlug | ''
  onChange: (value: WorkerTradeSlug | '') => void
  locked: boolean
  trades: WorkerTradesCopy
  copy: TitleCopy
}) {
  const helperText = !locked ? copy.help : value ? copy.lockedKept : copy.locked
  return (
    <FormField
      label={
        <HStack as="span" gap={2}>
          <span>{copy.label}</span>
          <Badge variant="success" size="sm" shape="pill">
            {copy.pro}
          </Badge>
        </HStack>
      }
      helperText={helperText}
      helperAction={
        locked ? (
          <Link
            href="/pricing"
            fontWeight={500}
            color="text.link"
            data-title-see-plans=""
          >
            {copy.seePlans}
          </Link>
        ) : undefined
      }
    >
      <Select
        disabled={locked}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as WorkerTradeSlug | '')
        }
        data-worker-title-select=""
      >
        <option value="">{copy.none}</option>
        {WORKER_PRIMARY_CATEGORIES.map(({ slug }) => (
          <option key={slug} value={slug}>
            {trades[slug].noun}
          </option>
        ))}
      </Select>
    </FormField>
  )
}

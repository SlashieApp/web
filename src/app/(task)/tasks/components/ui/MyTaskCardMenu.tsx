'use client'

import { Stack } from '@chakra-ui/react'
import { LuEllipsisVertical, LuPencil, LuShare2 } from 'react-icons/lu'

import { ReportControl } from '@/content/trust/ReportControl'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Button, Dropdown, IconButton, Link, useDropdownClose } from '@ui'

import { useShareTask } from '../../[slug]/components/overview/shareTask'
import type { MyTaskHubRow } from '../../helpers/myTasksHub'
import bag from '../../i11n.json'

function MenuItems({ row }: { row: MyTaskHubRow }) {
  const t = useI11n(bag)
  const close = useDropdownClose()
  const localize = useLocalizedHref()
  const hosted = row.roles.includes('hosted')
  const share = useShareTask(
    row.title,
    () => new URL(localize(`/tasks/${row.id}`), window.location.origin).href,
  )

  return (
    <Stack gap={0.5}>
      <Button
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={() => {
          close()
          void share()
        }}
      >
        <LuShare2 aria-hidden />
        {t.menu.share}
      </Button>
      {hosted && row.section === 'open' ? (
        <Button asChild variant="ghost" justifyContent="flex-start" w="full">
          <Link
            href={`/tasks/${row.id}/edit`}
            _hover={{ textDecoration: 'none' }}
            onClick={close}
          >
            <LuPencil aria-hidden />
            {t.menu.edit}
          </Link>
        </Button>
      ) : null}
      {hosted ? null : (
        <ReportControl
          kind="task"
          targetId={row.id}
          targetTitle={row.title}
          targetMeta={row.location || undefined}
          targetImageSrc={row.thumbnailSrc}
          variant="menu"
          onOpened={close}
        />
      )}
    </Stack>
  )
}

/**
 * A My Tasks card's ⋮ menu: Share task for every row, Edit task on your own
 * open tasks, Report task only on other people's tasks.
 */
export function MyTaskCardMenu({ row }: { row: MyTaskHubRow }) {
  const t = useI11n(bag)
  return (
    <Dropdown
      contentLabel={t.menu.aria}
      mobilePlacement="bottom"
      align="end"
      width="max-content"
      trigger={
        <IconButton type="button" variant="ghost" aria-label={t.menu.aria}>
          <LuEllipsisVertical />
        </IconButton>
      }
    >
      <MenuItems row={row} />
    </Dropdown>
  )
}

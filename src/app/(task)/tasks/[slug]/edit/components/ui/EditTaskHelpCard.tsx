'use client'

import { Stack, Text } from '@chakra-ui/react'
import { LuCircleHelp, LuShieldCheck } from 'react-icons/lu'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { Button, Card, Link } from '@ui'

import bag from '../../i11n.json'

/** "Need help?" rail card under the edit preview. */
export function EditTaskHelpCard() {
  const t = useI11n(bag)

  return (
    <Card
      layout="section"
      framed
      icon={<LuCircleHelp />}
      heading={t.help.heading}
      bodyGap={3}
    >
      <Text fontSize="sm" color="text.muted">
        {t.help.body}
      </Text>
      <Stack gap={1}>
        <Button
          asChild
          variant="ghost"
          size="sm"
          justifyContent="flex-start"
          ml={-3}
        >
          <Link href={SAFETY_HREF} _hover={{ textDecoration: 'none' }}>
            <LuShieldCheck />
            {t.help.safety}
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          justifyContent="flex-start"
          ml={-3}
        >
          <Link
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            _hover={{ textDecoration: 'none' }}
          >
            <LuCircleHelp />
            {t.help.contact}
          </Link>
        </Button>
      </Stack>
    </Card>
  )
}

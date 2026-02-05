'use client'

import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { UiButton } from '../Button/Button'
import { GlassCard } from '../Card/GlassCard'
import { TextInput } from '../Input/TextInput'

const ADD_OFFER = gql`
  mutation AddOffer($input: AddOfferInput!) {
    addOffer(input: $input) {
      id
      status
    }
  }
`

const ACCEPT_OFFER = gql`
  mutation AcceptOffer($input: AcceptOfferInput!) {
    acceptOffer(input: $input) {
      id
      status
    }
  }
`

export function LandingWorkerActions() {
  const [offerTaskId, setOfferTaskId] = useState('')
  const [offerPrice, setOfferPrice] = useState('4500')
  const [acceptOfferId, setAcceptOfferId] = useState('')

  const [addOffer, { loading: offering }] = useMutation(ADD_OFFER)
  const [acceptOffer, { loading: accepting }] = useMutation(ACCEPT_OFFER)

  return (
    <GlassCard p={6}>
      <Stack gap={4}>
        <Heading size="md">Worker actions</Heading>
        <Text color="muted">
          Demo actions wired to backend mutations. Use real IDs after creating
          tasks.
        </Text>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Stack gap={3}>
            <TextInput
              placeholder="Task ID for offer"
              value={offerTaskId}
              onChange={(e) => setOfferTaskId(e.target.value)}
            />
            <TextInput
              placeholder="Offer price (pence)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
            <UiButton
              size="sm"
              background="linkBlue.600"
              color="white"
              loading={offering}
              onClick={() =>
                addOffer({
                  variables: {
                    input: {
                      taskId: offerTaskId,
                      pricePence: Number(offerPrice) || 0,
                      message: 'Can do this tomorrow afternoon',
                    },
                  },
                })
              }
            >
              Submit offer
            </UiButton>
          </Stack>
          <Stack gap={3}>
            <TextInput
              placeholder="Offer ID to accept"
              value={acceptOfferId}
              onChange={(e) => setAcceptOfferId(e.target.value)}
            />
            <UiButton
              size="sm"
              background="mustard.500"
              color="black"
              loading={accepting}
              onClick={() =>
                acceptOffer({
                  variables: {
                    input: {
                      offerId: acceptOfferId,
                      paymentMethod: 'CARD',
                    },
                  },
                })
              }
            >
              Accept offer
            </UiButton>
          </Stack>
        </Grid>
        <Box borderBottomWidth="1px" borderColor="border" />
        <Text color="muted" fontSize="sm">
          Note: these actions require an authenticated user session (JWT in
          cookie).
        </Text>
      </Stack>
    </GlassCard>
  )
}

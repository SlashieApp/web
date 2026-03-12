import { gql } from '@apollo/client'

export const CREATE_JOB = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      description
      location
    }
  }
`

export const CREATE_QUOTE = gql`
  mutation CreateQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      id
      pricePence
      message
    }
  }
`

export const JOBS_QUERY = gql`
  query Jobs {
    jobs {
      id
      title
      description
      location
      photos
      createdByUserId
      createdAt
      quotes {
        id
        jobId
        handymanUserId
        pricePence
        message
        createdAt
      }
    }
  }
`

export const JOB_QUERY = gql`
  query Job($id: ID!) {
    job(id: $id) {
      id
      title
      description
      location
      photos
      createdAt
      quotes {
        id
        pricePence
        message
        handymanUserId
      }
    }
  }
`

import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      location
      photos
    }
  }
`

export const ADD_OFFER = gql`
  mutation AddOffer($input: AddOfferInput!) {
    addOffer(input: $input) {
      id
      pricePence
      message
    }
  }
`

export const TASKS_QUERY = gql`
  query Tasks {
    tasks {
      id
      title
      description
      location
      photos
      status
      createdByUserId
      createdAt
      offers {
        id
        taskId
        workerUserId
        pricePence
        message
        status
        createdAt
      }
    }
  }
`

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      title
      description
      location
      photos
      createdAt
      offers {
        id
        pricePence
        message
        workerUserId
      }
    }
  }
`

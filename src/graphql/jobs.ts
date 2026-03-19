import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      location
      dateTime
      category
      priceOfferPence
      paymentMethod
      contactMethod
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
      items {
        id
        title
        description
        location
        status
        createdByUserId
        createdAt
        dateTime
        category
        priceOfferPence
        paymentMethod
        contactMethod
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
      pageInfo {
        page
        pageSize
        totalItems
        totalPages
        hasNextPage
        hasPreviousPage
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
      status
      createdByUserId
      createdAt
      dateTime
      category
      priceOfferPence
      paymentMethod
      contactMethod
      offers {
        id
        taskId
        pricePence
        message
        workerUserId
        status
        createdAt
      }
    }
  }
`

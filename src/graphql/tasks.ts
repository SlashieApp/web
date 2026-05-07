import { gql } from '@apollo/client'

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      category
      acceptedWorkerCap
      budget {
        amount
        currency
        type
        paymentMethod
      }
      datetime {
        date
        time
        type
      }
      contactMethod
      images
      status
      completedAt
      confirmedAt
      createdAt
      location {
        lat
        lng
        name
        address
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
        }
      }
      quotes {
        id
      }
    }
  }
`

export const ADD_QUOTE = gql`
  mutation AddQuote($input: AddQuoteInput!) {
    addQuote(input: $input) {
      id
      taskId
      workerUserId
      price {
        currency
        amount
      }
      message
      status
      createdAt
      worker {
        id
        firstName
        lastName
        profile {
          name
          avatarUrl
        }
      }
    }
  }
`

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilter) {
    tasks(filter: $filter) {
      id
      title
      description
      category
      acceptedWorkerCap
      budget {
        amount
        currency
        type
        paymentMethod
      }
      datetime {
        date
        time
        type
      }
      contactMethod
      images
      status
      completedAt
      confirmedAt
      createdAt
      location {
        lat
        lng
        name
        address
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
          avatarUrl
        }
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
      category
      acceptedWorkerCap
      budget {
        amount
        currency
        type
        paymentMethod
      }
      datetime {
        date
        time
        type
      }
      contactMethod
      images
      status
      completedAt
      confirmedAt
      createdAt
      location {
        lat
        lng
        name
        address
      }
      poster {
        id
        firstName
        lastName
        profile {
          name
        }
      }
      quotes {
        id
        taskId
        workerUserId
        estimatedDuration
        price {
          currency
          amount
        }
        message
        status
        createdAt
        worker {
          id
          firstName
          lastName
          profile {
            name
            avatarUrl
          }
        }
      }
    }
  }
`

export const MY_TASKS_QUERY = gql`
  query MyTasks($filter: TaskFilter) {
    myTasks(filter: $filter) {
      id
      title
      description
      category
      acceptedWorkerCap
      budget {
        amount
        currency
        type
        paymentMethod
      }
      datetime {
        date
        time
        type
      }
      contactMethod
      images
      status
      completedAt
      confirmedAt
      createdAt
      location {
        lat
        lng
        name
        address
      }
      poster {
        id
      }
      quotes {
        id
        taskId
        workerUserId
        price {
          currency
          amount
        }
        message
        status
        createdAt
      }
    }
  }
`

export const ACCEPT_QUOTE_MUTATION = gql`
  mutation AcceptQuote($quoteId: ID, $input: AcceptQuoteInput) {
    acceptQuote(quoteId: $quoteId, input: $input) {
      id
      status
    }
  }
`

export const MAKE_QUOTE_MUTATION = gql`
  mutation MakeQuote($taskId: ID!, $price: PriceInput!, $message: String) {
    makeQuote(taskId: $taskId, price: $price, message: $message) {
      id
      price {
        currency
        amount
      }
      message
      status
    }
  }
`

export const CANCEL_TASK_MUTATION = gql`
  mutation CancelTask($taskId: ID!) {
    cancelTask(taskId: $taskId) {
      id
      status
    }
  }
`

export const COMPLETE_TASK_MUTATION = gql`
  mutation CompleteTask($taskId: ID!) {
    completeTask(taskId: $taskId) {
      id
      status
      completedAt
    }
  }
`

export const CONFIRM_TASK_MUTATION = gql`
  mutation ConfirmTask($taskId: ID!) {
    confirmTask(taskId: $taskId) {
      id
      status
      confirmedAt
    }
  }
`

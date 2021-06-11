import gql from 'graphql-tag'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

export const schema = makeExecutableSchema({
  typeDefs: gql`
    type Query {
      hello: String
    }

    type Subscription {
      count: String
    }
  `,
  resolvers: {
    Query: { hello: () => 'World' },
    Subscription: { sup: { subscribe: () => pubsub.asyncIterator(['COUNT']) } }
  }
})

let currentNumber = 1
let reg = false

const register = () => {
  if (currentNumber > 1000) return
  pubsub.publish('COUNT', { count: String(++currentNumber) })
  setTimeout(register, 1000)
}

export const count = () => {
  if (!reg) register()
  reg = true
  return
}

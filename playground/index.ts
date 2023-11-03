import { createServer } from 'node:http'
import { resolveOffsetConnection } from 'ts-relay-cursor-paging'
import { GraphQLError } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'

function datasLine() {
  const datas = []

  for (let i = 0; i < 100; i++) {
    datas.push({
      id: i,
      name: `Library ${i}`,
    })
  }

  return datas
}
export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    scalar Cursor

    type PageInfo {
      hasNextPage: Boolean
      hasPreviousPage: Boolean
      startCursor: Cursor
      endCursor: Cursor
      totalPageCount: Int
    }

    type Library {
      id: ID!
      name: String!
    }

    type LibraryEdge {
        cursor: String!
        node: Library!
    }

    type LibraryConnection {
      edges: [LibraryEdge!]!
      pageInfo: PageInfo!
    }
 
    type Query {
      libraries(
        first: Int
        after: Cursor
        last: Int
        before: Cursor
      ): LibraryConnection  
    }
  `,
  resolvers: {
    Query: {
      libraries: async (_parent, _args, _context, _info) => {
        const generator = datasLine()

        async function resolveData({ offset, limit }: { offset: number; limit: number }) {
          const slicedData = generator.slice(offset, offset + limit)
          return slicedData
        }

        const datas = await resolveOffsetConnection({ args: _args }, ({ limit, offset }) => {
          return resolveData({ limit, offset })
        })

        if (!generator)
          throw new GraphQLError('No libraries found')

        return {
          edges: datas.edges,
          pageInfo: {
            ...datas.pageInfo,
          },
        }
      },
    },
  },
})

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema })

// Pass it into a server to hook into request handlers.
const server = createServer(yoga)

// Start the server and you're done!
server.listen(3100, () => {
  // eslint-disable-next-line no-console
  console.info('Server is running on http://localhost:3100/graphql')
})

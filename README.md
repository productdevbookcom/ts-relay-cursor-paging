# TS Relay Cursor Paging

![TS Relay Cursor Paging](https://github.com/productdevbookcom/ts-relay-cursor-paging/blob/main/.github/assets/urql-storage-capacitor.png?raw=true)

 <p>
  <a href="https://www.npmjs.com/package/ts-relay-cursor-paging"><img src="https://img.shields.io/npm/v/ts-relay-cursor-paging.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Version"></a>
  <a href="https://www.npmjs.com/package/ts-relay-cursor-paging"><img src="https://img.shields.io/npm/dm/ts-relay-cursor-paging.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="Downloads"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/ts-relay-cursor-paging/ts-relay-cursor-paging.svg?style=flat&colorA=18181B&colorB=28CF8D" alt="License"></a>
 </p>

## Description
Simple relay cursor paging for graphql

## Installation

```bash
pnpm add ts-relay-cursor-paging
```


## Demo 

Open graphql playground in your browser port 4000/graphql

[![Edit ts-relay-cursor-paging](https://codesandbox.io/static/img/play-codesandbox.svg)](https://githubbox.com/productdevbook/productdevbook/tree/main/examples/graphql/relay-cursor-paging)

### Docs
```ts
import { offsetForArgs } from 'ts-relay-cursor-paging'
import { connectionFromArraySlice } from 'graphql-relay'

const
  {
    limit, offset, expectedSize,
    hasNextPage, hasPreviousPage
  } = offsetForArgs({
    args: {
      first: _args.first,
      last: _args.last,
      after: _args.after,
      before: _args.before,
    },
    defaultSize: 10,
    maxSize: 100,
  })

// ... connection logic db or orm used ...

const page = connectionFromArraySlice(data, _args, {
  arrayLength: data.length,
  sliceStart: offset,
})

return {
  edges: page.edges,
  pageInfo: {
    ...page.pageInfo,
    totalPageCount: expectedSize,
  },
}
```

## Usage

<details><summary>Graphql Yoga 3</summary>

```ts
import { createServer } from 'node:http'
import { offsetForArgs } from 'ts-relay-cursor-paging'
import { connectionFromArraySlice } from 'graphql-relay'
import { GraphQLError } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'

const data = [
  {
    id: 1,
    name: 'Library 1',
  },
  {
    id: 2,
    name: 'Library 2',
  },
  {
    id: 3,
    name: 'Library 3',
  },
  {
    id: 4,
    name: 'Library 4',
  },
]

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
      libraries: async (_parent, _args, context, _info) => {
        const { limit, offset, expectedSize } = offsetForArgs({
          args: {
            first: _args.first,
            last: _args.last,
            after: _args.after,
            before: _args.before,
          },
        })

        if (!data)
          throw new GraphQLError('No libraries found')

        const page = connectionFromArraySlice(data, _args, {
          arrayLength: data.length,
          sliceStart: offset,
        })
        return {
          edges: page.edges,
          pageInfo: {
            ...page.pageInfo,
            totalPageCount: expectedSize,
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
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})
```
</details>
</br>

## Inspiration
Codes in this build are inspired by [pothos](https://github.com/hayes/pothos) and from there the codes were copied. Thanks you for your great work.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/oku-ui/static/sponsors/sponsors.svg">
    <img alt="sponsors" src='https://cdn.jsdelivr.net/gh/oku-ui/static/sponsors/sponsors.svg'/>
  </a>
</p>


 ## License

MIT License © 2022-PRESENT [productdevbook](https://github.com/productdevbook)
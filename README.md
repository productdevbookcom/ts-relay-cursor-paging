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

[![Edit ts-relay-cursor-paging](https://codesandbox.io/static/img/play-codesandbox.svg)](https://githubbox.com/productdevbookcom/ts-relay-cursor-paging/tree/main/playground)

## Docs

### resolveOffsetConnection

```ts
import { resolveOffsetConnection } from 'ts-relay-cursor-paging'

resolveOffsetConnection({ args }, ({ limit, offset }) => {
  const items = []

  for (let i = offset; i < Math.min(offset + limit, 200); i += 1)
    items.push(new NumberThing(i))

  return items
})
```

### resolveCursorConnection
```ts
import { resolveCursorConnection } from 'ts-relay-cursor-paging'

const objects: { id: number }[] = []

for (let i = 0; i < 100; i += 1)
  objects.push({ id: i + 1 })

function queryWithCursor(limit: number, inverted: boolean, after?: string, before?: string) {
  const list = objects.filter(({ id }) => {
    if (before && id >= Number.parseInt(before, 10))
      return false

    if (after && id <= Number.parseInt(after, 10))
      return false

    return true
  })

  return (inverted ? list.reverse() : list).slice(0, limit)
}

// resolveCursorConnection

resolveCursorConnection(
  {
    defaultSize: 5,
    maxSize: 8,
    args,
    toCursor: obj => obj.id.toString(),
  },
  ({ before, after, inverted, limit }: ResolveCursorConnectionArgs) =>
    queryWithCursor(limit, inverted, after, before),
)
```

### resolveArrayConnection

 ```ts
 import { resolveArrayConnection } from 'ts-relay-cursor-paging'

 const numbers: { id: number }[] = []

 for (let i = 0; i < 200; i += 1)
   numbers.push({ id: i + 1 })

 resolveArrayConnection({ args }, numbers)
```

## Usage

<details><summary>Graphql Yoga 3</summary>

```ts
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

        async function resolveData({ offset, limit }: { offset: number, limit: number }) {
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
  console.info('Server is running on http://localhost:3100/graphql')
})
```
</details>
</br>

## Inspiration
Codes in this build are inspired by [pothos](https://github.com/hayes/pothos) and from there the codes were copied. Thanks you for your great work.

## Credits
- [pothos](https://github.com/hayes/pothos)
- [graphql-relay-js](https://github.com/graphql/graphql-relay-js)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/oku-ui/static/sponsors/sponsors.svg">
    <img alt="sponsors" src='https://cdn.jsdelivr.net/gh/oku-ui/static/sponsors/sponsors.svg'/>
  </a>
</p>

 ## License

MIT License © 2022-PRESENT [productdevbook](https://github.com/productdevbook)

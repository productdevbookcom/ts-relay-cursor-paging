import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLNamedOutputType,
  GraphQLNonNull,
  GraphQLObjectType,
  ThunkObjMap,
} from 'graphql'

export type MaybePromise<T> = Promise<T> | T

export interface DefaultConnectionArguments {
  first?: number | null | undefined
  last?: number | null | undefined
  before?: string | null | undefined
  after?: string | null | undefined
}

export interface ResolveOffsetConnectionOptions {
  args: DefaultConnectionArguments
  defaultSize?: number
  maxSize?: number
}

export interface ResolveCursorConnectionOptions<T> {
  args: DefaultConnectionArguments
  defaultSize?: number
  maxSize?: number
  toCursor: (value: T, nodes: T[]) => string
}

export interface ResolveCursorConnectionArgs {
  before?: string
  after?: string
  limit: number
  inverted: boolean
}

export interface ResolveOffsetConnectionOptions {
  args: ConnectionArguments
  defaultSize?: number
  maxSize?: number
}

export interface ResolveCursorConnectionOptions<T> {
  args: ConnectionArguments
  defaultSize?: number
  maxSize?: number
  toCursor: (value: T, nodes: T[]) => string
}

export interface ResolveCursorConnectionArgs {
  before?: string
  after?: string
  limit: number
  inverted: boolean
}

export interface ResolveArrayConnectionOptions {
  args: ConnectionArguments
  defaultSize?: number
  maxSize?: number
}

/**
 * A type designed to be exposed as a `Connection` over GraphQL.
 */
export interface Connection<T, I> {
  edges: Array<Edge<T>>
  pageInfo: PageInfo
  context?: {
    [key: string]: I
  }
}

/**
 * A type alias for cursors in this implementation.
 */
export type ConnectionCursor = string

/**
 * A type describing the arguments a connection field receives in GraphQL.
 */
export interface ConnectionArguments {
  before?: ConnectionCursor | null | undefined
  after?: ConnectionCursor | null | undefined
  first?: number | null | undefined
  last?: number | null | undefined
}

export interface ConnectionConfig {
  name?: string
  nodeType: GraphQLNamedOutputType | GraphQLNonNull<GraphQLNamedOutputType>
  resolveNode?: GraphQLFieldResolver<any, any>
  resolveCursor?: GraphQLFieldResolver<any, any>
  edgeFields?: ThunkObjMap<GraphQLFieldConfig<any, any>>
  connectionFields?: ThunkObjMap<GraphQLFieldConfig<any, any>>
}

export interface GraphQLConnectionDefinitions {
  edgeType: GraphQLObjectType
  connectionType: GraphQLObjectType
}

/**
 * A type designed to be exposed as a `Edge` over GraphQL.
 */
export interface Edge<T> {
  node: T
  cursor: ConnectionCursor
}

/**
 * A type designed to be exposed as `PageInfo` over GraphQL.
 */
export interface PageInfo {
  startCursor?: ConnectionCursor | null
  endCursor?: ConnectionCursor | null
  hasPreviousPage: boolean
  hasNextPage: boolean
}

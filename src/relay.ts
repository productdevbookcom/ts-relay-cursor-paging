import { Buffer } from 'node:buffer'
import type { Connection, MaybePromise, ResolveArrayConnectionOptions, ResolveCursorConnectionArgs, ResolveCursorConnectionOptions, ResolveOffsetConnectionOptions } from './types'

const OFFSET_CURSOR_PREFIX = 'OffsetConnection:'
const DEFAULT_MAX_SIZE = 100
const DEFAULT_SIZE = 20
export function offsetForArgs(options: ResolveOffsetConnectionOptions) {
  const { before, after, first, last } = options.args
  const defaultSize = options.defaultSize ?? DEFAULT_SIZE
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE
  const beforeOffset = before ? cursorToOffset(before) : Number.POSITIVE_INFINITY
  const afterOffset = after ? cursorToOffset(after) : 0

  if (first != null && first < 0)
    throw new Error('Argument "first" must be a non-negative integer')

  if (last != null && last < 0)
    throw new Error('Argument "last" must be a non-negative integer')

  let startOffset = after ? afterOffset + 1 : 0
  let endOffset = before ? Math.max(beforeOffset, startOffset) : Number.POSITIVE_INFINITY

  if (first != null)
    endOffset = Math.min(endOffset, startOffset + first)

  if (last != null) {
    if (endOffset === Number.POSITIVE_INFINITY)
      throw new Error('Argument "last" can only be used in combination with "before" or "first"')

    startOffset = Math.max(startOffset, endOffset - last)
  }

  const size = first == null && last == null ? defaultSize : endOffset - startOffset
  endOffset = Math.min(endOffset, startOffset + Math.min(size, maxSize))
  const totalSize = endOffset - startOffset

  return {
    offset: startOffset,
    limit: totalSize + 1,
    hasPreviousPage: startOffset > 0,
    expectedSize: totalSize,
    hasNextPage: (resultSize: number) => resultSize > totalSize,
  }
}

export async function resolveOffsetConnection<
  T,
  U extends Promise<readonly T[] | null> | readonly T[] | null,
  I,
>(
  options: ResolveOffsetConnectionOptions,
  resolve: (params: {
    offset: number
    limit: number
  }) => U & (MaybePromise<readonly T[] | null> | null),
  context?: (params: ResolveCursorConnectionArgs) => I,
): Promise<Connection<T, I>> {
  const { limit, offset, expectedSize, hasPreviousPage, hasNextPage } = offsetForArgs(options)

  const nodes = (await resolve({ offset, limit })) as T[] | null

  if (!nodes)
    return nodes as never

  const edges = nodes.map((value, index) => value == null
    ? null
    : {
        cursor: offsetToCursor(offset + index),
        node: value,
      },
  )
  const trimmed = edges.slice(0, expectedSize)
  return {
    edges: trimmed as never,
    pageInfo: {
      startCursor: offsetToCursor(offset),
      endCursor: offsetToCursor(offset + trimmed.length - 1),
      hasPreviousPage,
      hasNextPage: hasNextPage(nodes.length),
    },
    context: {
      ...context?.({ before: undefined, after: undefined, limit, inverted: false }) ?? {},
      ...(nodes as any).context ?? {},
    },
  }
}

export function cursorToOffset(cursor: string): number {
  const string = Buffer.from(cursor, 'base64').toString()
  if (!string.startsWith(OFFSET_CURSOR_PREFIX))
    throw new Error(`Invalid offset cursor ${OFFSET_CURSOR_PREFIX}`)

  return Number.parseInt(string.slice(OFFSET_CURSOR_PREFIX.length), 10)
}
export function offsetToCursor(offset: number): string {
  return Buffer.from(`${OFFSET_CURSOR_PREFIX}${offset}`).toString('base64')
}

export function resolveArrayConnection<T, I>(
  options: ResolveArrayConnectionOptions,
  array: readonly T[],
  context?: (params: ResolveCursorConnectionArgs) => I,
): Connection<T, I> {
  const { limit, offset, expectedSize, hasPreviousPage, hasNextPage } = offsetForArgs(options)

  const nodes = array.slice(offset, offset + limit)

  const edges = nodes.map((value, index) => value == null
    ? null
    : {
        cursor: offsetToCursor(offset + index),
        node: value,
      },
  )

  const trimmed = edges.slice(0, expectedSize)

  return {
    edges: trimmed as never,
    pageInfo: {
      startCursor: offsetToCursor(offset),
      endCursor: offsetToCursor(offset + trimmed.length - 1),
      hasPreviousPage,
      hasNextPage: hasNextPage(nodes.length),
    },
    context: {
      ...context?.({ before: undefined, after: undefined, limit, inverted: false }) ?? {},
      ...(nodes as any).context ?? {},
    },
  }
}

function parseCurserArgs(options: ResolveOffsetConnectionOptions) {
  const { before, after, first, last } = options.args

  const defaultSize = options.defaultSize ?? DEFAULT_SIZE
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE

  if (first != null && first < 0)
    throw new Error('Argument "first" must be a non-negative integer')

  if (last != null && last < 0)
    throw new Error('Argument "last" must be a non-negative integer')

  const limit = Math.min(first ?? last ?? defaultSize, maxSize) + 1
  const inverted = after ? !!last && !first : (!!before && !first) || (!first && !!last)

  return {
    before: before ?? undefined,
    after: after ?? undefined,
    limit,
    expectedSize: limit - 1,
    inverted,
    hasPreviousPage: (resultSize: number) => (inverted ? resultSize >= limit : !!after),
    hasNextPage: (resultSize: number) => (inverted ? !!before : resultSize >= limit),
  }
}

type NodeType<T> = T extends Promise<(infer N)[] | null> | (infer N)[] | null ? N : never

export async function resolveCursorConnection<
  U extends Promise<readonly unknown[] | null> | readonly unknown[] | null,
  I,
>(
  options: ResolveCursorConnectionOptions<NodeType<U>>,
  resolve: (params: ResolveCursorConnectionArgs) => U,
  context?: (params: ResolveCursorConnectionArgs) => I,
): Promise<Connection<NodeType<U>, I>> {
  const { before, after, limit, inverted, expectedSize, hasPreviousPage, hasNextPage }
    = parseCurserArgs(options)

  const nodes = (await resolve({ before, after, limit, inverted })) as NodeType<U>[] | null

  if (!nodes)
    return nodes as never

  const trimmed = nodes.slice(0, expectedSize)

  if (inverted)
    trimmed.reverse()

  const edges = trimmed.map(value =>
    value == null
      ? null
      : {
          cursor: options.toCursor(value, trimmed),
          node: value,
        },
  )

  const startCursor
    = edges.length > 0 ? edges[0]?.cursor : options.args.after ?? options.args.before ?? ''
  const endCursor
    = edges.length > 0
      ? edges[edges.length - 1]?.cursor
      : options.args.after ?? options.args.before ?? ''

  return {
    edges: edges as never,
    pageInfo: {
      startCursor,
      endCursor,
      hasPreviousPage: hasPreviousPage(nodes.length),
      hasNextPage: hasNextPage(nodes.length),
    },
    context: {
      ...context?.({ before, after, limit, inverted }) ?? {},
      ...(nodes as any).context ?? {},
    },
  }
}

import { describe, it } from 'vitest'

// The two tests marked with concurrent will be run in parallel
describe('suite', () => {
  it('serial test', async () => { /* ... */ })
  // eslint-disable-next-line unused-imports/no-unused-vars
  it.concurrent('concurrent test 1', async ({ expect }) => { /* ... */ })
  // eslint-disable-next-line unused-imports/no-unused-vars
  it.concurrent('concurrent test 2', async ({ expect }) => { /* ... */ })
})

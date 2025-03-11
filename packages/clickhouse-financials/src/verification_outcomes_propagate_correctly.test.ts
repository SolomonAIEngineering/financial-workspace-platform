import { describe, expect, test } from 'vitest'

import { ClickHouse } from './index'
import { ClickHouseContainer } from './testutil'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

describe.each([10, 100, 1_000, 10_000])('with %i verifications', (n) => {
  test(
    'verifications are propagated correctly',
    async (t) => {
      const container = await ClickHouseContainer.start(t)

      const ch = new ClickHouse({ url: container.url() })

      const workspaceId = randomUUID()
      const keySpaceId = randomUUID()
      const keyId = randomUUID()

      const end = Date.now()
      const interval = 90 * 24 * 60 * 60 * 1000 // 90 days
      const start = end - interval
      const outcomes = {
        VALID: 0,
        RATE_LIMITED: 0,
        DISABLED: 0,
      }
      const verifications = Array.from({ length: n }).map((_) => {
        const outcome = Object.keys(outcomes)[
          Math.floor(Math.random() * Object.keys(outcomes).length)
        ] as keyof typeof outcomes
        outcomes[outcome]++
        return {
          request_id: randomUUID(),
          time: Math.round(Math.random() * (end - start + 1) + start),
          workspace_id: workspaceId,
          key_space_id: keySpaceId,
          key_id: keyId,
          outcome,
          region: 'test',
          tags: ['tag'],
        }
      })

      // Insert in smaller batches to prevent timeouts
      const batchSize = 100
      for (let i = 0; i < verifications.length; i += batchSize) {
        const { err } = await ch.verifications.insert(
          verifications.slice(i, i + batchSize),
        )
        expect(err).toBeUndefined()
      }

      // Wait for materialized views to be updated
      const waitTime = Math.min(5000 + Math.floor(n / 100) * 1000, 30000)
      await new Promise((r) => setTimeout(r, waitTime))

      // Verify raw table counts
      const count = await ch.querier.query({
        query:
          'SELECT count(*) as count FROM verifications.raw_key_verifications_v1',
        schema: z.object({ count: z.number().int() }),
      })({})

      expect(count.err).toBeUndefined()
      expect(count.val![0].count).toBe(n)

      // Verify materialized view counts
      const mvCount = await ch.querier.query({
        query: `
            SELECT count(*) as count
            FROM verifications.key_verifications_per_hour_v1
            WHERE workspace_id = '${workspaceId}'
          `,
        schema: z.object({ count: z.number().int() }),
      })({})

      expect(mvCount.err).toBeUndefined()
      expect(mvCount.val![0].count).toBeGreaterThan(0)

      // Cleanup
      await container.stop()
    },
    { timeout: 180_000 },
  )
})

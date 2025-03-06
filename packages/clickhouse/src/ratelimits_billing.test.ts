import { expect, test } from 'vitest'

import { randomUUID } from 'node:crypto'
import { ClickHouse } from './index'
import { ClickHouseContainer } from './testutil'

test(
  'returns the correct amount of billable ratelimits',
  {
    timeout: 180_000,
  },
  async (t) => {
    const container = await ClickHouseContainer.start(t)

    const ch = new ClickHouse({ url: container.url() })

    const workspaceId = randomUUID()
    const namespaceId = randomUUID()
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth() + 1 // 1 = January
    const endTime = now.getTime()
    const startTime = now.setUTCDate(1)

    let billable = 0
    const batchSize = 1000
    const totalBatches = 50

    for (let batch = 0; batch < totalBatches; batch++) {
      const ratelimits = new Array(batchSize).fill(null).map(() => {
        const passed = Math.random() > 0.2
        if (passed) {
          billable++
        }
        return {
          workspace_id: workspaceId,
          namespace_id: namespaceId,
          identifier: randomUUID(),
          passed,
          time: Math.floor(startTime + Math.random() * (endTime - startTime)),
          request_id: randomUUID(),
        }
      })

      const { err } = await ch.ratelimits.insert(ratelimits)
      expect(err).toBeUndefined()

      // Small wait between batches to prevent overwhelming the server
      await new Promise((r) => setTimeout(r, 100))
    }

    // Wait for materialized views to be updated
    await new Promise((r) => setTimeout(r, 5000))

    const billableRatelimits = await ch.billing.billableRatelimits({
      workspaceId,
      year,
      month,
    })

    expect(billableRatelimits).toBe(billable)

    // Cleanup
    await container.stop()
  },
)

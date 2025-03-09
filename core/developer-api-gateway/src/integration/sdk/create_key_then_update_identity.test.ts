import { expect, test } from 'vitest'

import { IntegrationHarness } from '@/pkg/testutil/integration-harness'
import { SolomonAI } from '@solomonai/api/src/index' // use unbundled raw esm typescript
import { newId } from '@solomonai/id'

test('create key and then update the identity', async (t) => {
  const h = await IntegrationHarness.init(t)

  const root = await h.createRootKey([
    `api.${h.resources.userApi.id}.create_key`,
    'identity.*.create_identity',
    'identity.*.update_identity',
  ])
  const client = new SolomonAI({ baseUrl: h.baseUrl, rootKey: root.key })

  const userId = newId('test')
  const externalId = newId('test')

  const key = await client.keys.create({
    apiId: h.resources.userApi.id,
    prefix: 'XXX',
    externalId: externalId,
    name: 'org_test',
  })

  expect(key.error).toBeUndefined()

  const identity = await client.identities.update({
    externalId,
    environment: 'default',
    meta: {
      userId,
    },
    ratelimits: [
      {
        name: 'default',
        limit: 50,
        duration: 1000,
      },
    ],
  })

  expect(identity.error).toBeUndefined()
  expect(identity.result!.meta.userId).toEqual(userId)
}, 10_000)

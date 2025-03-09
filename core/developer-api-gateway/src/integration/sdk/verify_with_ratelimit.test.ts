import { expect, test } from 'vitest'

import { IntegrationHarness } from '@/pkg/testutil/integration-harness'
import { SolomonAI } from '@solomonai/api/src/index' // use unbundled raw esm typescript
import { schema } from '@solomonai/db'
import { newId } from '@solomonai/id'

test('1 per 10 seconds', async (t) => {
  const h = await IntegrationHarness.init(t)

  const root = await h.createRootKey([
    `api.${h.resources.userApi.id}.create_key`,
  ])

  await h.db.primary.insert(schema.roles).values({
    id: newId('test'),
    workspaceId: h.resources.userWorkspace.id,
    name: 'role',
  })

  const sdk = new SolomonAI({
    baseUrl: h.baseUrl,
    rootKey: root.key,
  })

  const { result: key, error: createKeyError } = await sdk.keys.create({
    apiId: h.resources.userApi.id,
    ownerId: 'ownerId',
    roles: ['role'],
    ratelimit: {
      limit: 1,
      duration: 10000,
      async: false,
    },
  })
  expect(createKeyError).toBeUndefined()
  expect(key).toBeDefined()

  const { result: firstVerify, error: firstVerifyError } =
    await sdk.keys.verify({
      apiId: h.resources.userApi.id,
      key: key!.key,
      ratelimit: {
        cost: 1,
      },
    })
  expect(firstVerifyError).toBeUndefined()
  expect(firstVerify).toBeDefined()
  expect(firstVerify!.code).toBe('VALID')

  const { result: secondVerify, error: secondVerifyError } =
    await sdk.keys.verify({
      apiId: h.resources.userApi.id,
      key: key!.key,
    })
  expect(secondVerifyError).toBeUndefined()
  expect(secondVerify).toBeDefined()
  expect(secondVerify!.code).toBe('RATE_LIMITED')
})

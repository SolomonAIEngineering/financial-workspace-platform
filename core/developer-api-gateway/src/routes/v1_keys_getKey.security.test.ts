import { describe, expect, test } from 'vitest'

import { runCommonRouteTests } from '@/pkg/testutil/common-tests'
import { schema } from '@solomonai/db'
import { sha256 } from '@solomonai/hash'
import { newId } from '@solomonai/id'
import { KeyV1 } from '@solomonai/keys'
import { randomUUID } from 'node:crypto'
import { IntegrationHarness } from 'src/pkg/testutil/integration-harness'
import type { V1KeysGetKeyResponse } from './v1_keys_getKey'

runCommonRouteTests({
  prepareRequest: async (h) => {
    const keyId = newId('test')
    const key = new KeyV1({ prefix: 'test', byteLength: 16 }).toString()
    await h.db.primary.insert(schema.keys).values({
      id: keyId,
      keyAuthId: h.resources.userKeyAuth.id,
      hash: await sha256(key),
      start: key.slice(0, 8),
      workspaceId: h.resources.userWorkspace.id,
      createdAt: new Date(),
    })
    return {
      method: 'GET',
      url: `/v1/keys.getKey?keyId=${keyId}`,
    }
  },
})

describe('correct roles', () => {
  describe.each([
    { name: 'legacy', roles: ['*'] },
    { name: 'legacy and more', roles: ['*', randomUUID()] },
    { name: 'wildcard api', roles: ['api.*.read_key', 'api.*.read_api'] },
    {
      name: 'wildcard mixed',
      roles: ['api.*.read_key', (apiId: string) => `api.${apiId}.read_api`],
    },
    {
      name: 'wildcard mixed 2',
      roles: ['api.*.read_api', (apiId: string) => `api.${apiId}.read_key`],
    },
    {
      name: 'wildcard and more',
      roles: ['api.*.read_key', 'api.*.read_api', randomUUID()],
    },
    {
      name: 'specific apiId',
      roles: [
        (apiId: string) => `api.${apiId}.read_key`,
        (apiId: string) => `api.${apiId}.read_api`,
      ],
    },
    {
      name: 'specific apiId and more',
      roles: [
        (apiId: string) => `api.${apiId}.read_key`,
        (apiId: string) => `api.${apiId}.read_api`,
        randomUUID(),
      ],
    },
  ])('$name', ({ roles }) => {
    test('returns 200', async (t) => {
      const h = await IntegrationHarness.init(t)
      const keyId = newId('test')
      const key = new KeyV1({ prefix: 'test', byteLength: 16 }).toString()
      await h.db.primary.insert(schema.keys).values({
        id: keyId,
        keyAuthId: h.resources.userKeyAuth.id,
        hash: await sha256(key),
        start: key.slice(0, 8),
        workspaceId: h.resources.userWorkspace.id,
        createdAt: new Date(),
      })

      const root = await h.createRootKey(
        roles.map((role) =>
          typeof role === 'string' ? role : role(h.resources.userApi.id),
        ),
      )

      const res = await h.get<V1KeysGetKeyResponse>({
        url: `/v1/keys.getKey?keyId=${keyId}`,
        headers: {
          Authorization: `Bearer ${root.key}`,
        },
      })
      expect(
        res.status,
        `expected 200, received: ${JSON.stringify(res, null, 2)}`,
      ).toBe(200)
    })
  })
})

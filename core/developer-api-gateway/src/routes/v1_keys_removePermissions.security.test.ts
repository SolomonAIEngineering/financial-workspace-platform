import { runCommonRouteTests } from '@/pkg/testutil/common-tests'
import { randomUUID } from 'node:crypto'
import { IntegrationHarness } from 'src/pkg/testutil/integration-harness'

import { describe, expect, test } from 'vitest'
import type {
  V1KeysRemovePermissionsRequest,
  V1KeysRemovePermissionsResponse,
} from './v1_keys_removePermissions'

runCommonRouteTests<V1KeysRemovePermissionsRequest>({
  prepareRequest: async (h) => {
    const { keyId } = await h.createKey()

    return {
      method: 'POST',
      url: '/v1/keys.removePermissions',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        keyId,
        permissions: [
          {
            name: 'hello',
          },
        ],
      },
    }
  },
})
describe('correct permissions', () => {
  describe.each([
    { name: 'legacy', permissions: ['*'] },
    { name: 'legacy and more', permissions: ['*', randomUUID()] },
  ])('$name', ({ permissions }) => {
    test('returns 200', async (t) => {
      const h = await IntegrationHarness.init(t)
      const root = await h.createRootKey(permissions)

      const { keyId } = await h.createKey()

      const res = await h.post<
        V1KeysRemovePermissionsRequest,
        V1KeysRemovePermissionsResponse
      >({
        url: '/v1/keys.removePermissions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${root.key}`,
        },
        body: {
          keyId,
          permissions: [
            {
              name: 'hello',
            },
            { name: 'there' },
          ],
        },
      })

      expect(
        res.status,
        `expected status 200, received: ${JSON.stringify(res, null, 2)}`,
      ).toEqual(200)

      const found = await h.db.primary.query.keys.findFirst({
        where: (table, { eq }) => eq(table.id, keyId),
        with: {
          permissions: {
            with: {
              permission: true,
            },
          },
        },
      })
      expect(found).toBeDefined()
      expect(found!.permissions.length).toBe(0)
    })
  })
})

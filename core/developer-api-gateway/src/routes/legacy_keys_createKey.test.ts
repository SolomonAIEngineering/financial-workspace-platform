import { describe, expect, test } from 'vitest'
import type {
  LegacyKeysCreateKeyRequest,
  LegacyKeysCreateKeyResponse,
} from './legacy_keys_createKey'

import type { ErrorResponse } from '@/pkg/errors'
import { IntegrationHarness } from '@/pkg/testutil/integration-harness'
import { sha256 } from '@solomonai/hash'

describe('simple', () => {
  test('creates key', async (t) => {
    const h = await IntegrationHarness.init(t)
    const { key: rootKey } = await h.createRootKey(['*'])

    const res = await h.post<
      LegacyKeysCreateKeyRequest,
      LegacyKeysCreateKeyResponse
    >({
      url: '/v1/keys',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rootKey}`,
      },
      body: {
        byteLength: 16,
        apiId: h.resources.userApi.id,
      },
    })

    expect(
      res.status,
      `expected 200, received: ${JSON.stringify(res, null, 2)}`,
    ).toBe(200)

    const found = await h.db.primary.query.keys.findFirst({
      where: (table, { eq }) => eq(table.id, res.body.keyId),
    })
    expect(found).toBeDefined()
    expect(found!.hash).toEqual(await sha256(res.body.key))
  })
})

describe('wrong ratelimit type', () => {
  test('reject the request', async (t) => {
    const h = await IntegrationHarness.init(t)
    const { key: rootKey } = await h.createRootKey(['*'])

    const res = await h.post<LegacyKeysCreateKeyRequest, ErrorResponse>({
      url: '/v1/keys',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rootKey}`,
      },
      body: {
        byteLength: 16,
        apiId: h.resources.userApi.id,
        ratelimit: {
          // @ts-expect-error
          type: 'x',
        },
      },
    })

    expect(res.status).toEqual(400)
    expect(res.body.error.code).toEqual('BAD_REQUEST')
  })
})

describe('with prefix', () => {
  test('start includes prefix', async (t) => {
    const h = await IntegrationHarness.init(t)
    const { key: rootKey } = await h.createRootKey(['*'])

    const res = await h.post<
      LegacyKeysCreateKeyRequest,
      LegacyKeysCreateKeyResponse
    >({
      url: '/v1/keys',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rootKey}`,
      },
      body: {
        byteLength: 16,
        apiId: h.resources.userApi.id,
        prefix: 'prefix',
      },
    })

    expect(
      res.status,
      `expected 200, received: ${JSON.stringify(res, null, 2)}`,
    ).toBe(200)

    const key = await h.db.primary.query.keys.findFirst({
      where: (table, { eq }) => eq(table.id, res.body.keyId),
    })
    expect(key).toBeDefined()
    expect(key!.start.startsWith('prefix_')).toBe(true)
  })
})

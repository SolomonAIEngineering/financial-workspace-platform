import { describe, expect, test } from 'vitest'
import type {
  V1ApisDeleteApiRequest,
  V1ApisDeleteApiResponse,
} from './v1_apis_deleteApi'

import { schema } from '@solomonai/db'
import { newId } from '@solomonai/id'
import { randomUUID } from 'node:crypto'
import { IntegrationHarness } from 'src/pkg/testutil/integration-harness'

describe('without delete protection', () => {
  test('soft deletes the api', async (t) => {
    const h = await IntegrationHarness.init(t)
    const apiId = newId('test')
    await h.db.primary.insert(schema.apis).values({
      id: apiId,
      name: randomUUID(),
      workspaceId: h.resources.userWorkspace.id,
    })

    const root = await h.createRootKey([`api.${apiId}.delete_api`])
    const res = await h.post<V1ApisDeleteApiRequest, V1ApisDeleteApiResponse>({
      url: '/v1/apis.deleteApi',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${root.key}`,
      },
      body: {
        apiId,
      },
    })

    expect(
      res.status,
      `expected 200, received: ${JSON.stringify(res, null, 2)}`,
    ).toBe(200)
    expect(res.body).toEqual({})

    const found = await h.db.primary.query.apis.findFirst({
      where: (table, { eq, and }) => and(eq(table.id, apiId)),
    })
    expect(found).toBeDefined()
    expect(found!.deletedAt).not.toBeNull()
  })
})
describe('with delete protection', () => {
  test('returns an error', async (t) => {
    const h = await IntegrationHarness.init(t)
    const apiId = newId('test')
    await h.db.primary.insert(schema.apis).values({
      id: apiId,
      name: randomUUID(),
      workspaceId: h.resources.userWorkspace.id,
      deleteProtection: true,
    })

    const root = await h.createRootKey([`api.${apiId}.delete_api`])
    const res = await h.post<V1ApisDeleteApiRequest, V1ApisDeleteApiResponse>({
      url: '/v1/apis.deleteApi',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${root.key}`,
      },
      body: {
        apiId,
      },
    })

    expect(
      res.status,
      `expected 412, received: ${JSON.stringify(res, null, 2)}`,
    ).toBe(412)
    expect(res.body).toMatchObject({
      error: {
        code: 'DELETE_PROTECTED',
        docs: 'https://unkey.dev/docs/api-reference/errors/code/DELETE_PROTECTED',
        message: `api ${apiId} is protected from deletions`,
      },
    })

    const found = await h.db.primary.query.apis.findFirst({
      where: (table, { eq, and, isNull }) =>
        and(eq(table.id, apiId), isNull(table.deletedAt)),
    })
    expect(found).toBeDefined()
    expect(found!.deletedAt).toBeNull()
  })
})

import { expect, test } from 'vitest'
import type {
  V1KeysRemovePermissionsRequest,
  V1KeysRemovePermissionsResponse,
} from './v1_keys_removePermissions'

import { schema } from '@solomonai/db'
import { newId } from '@solomonai/id'
import { randomUUID } from 'node:crypto'
import { IntegrationHarness } from 'src/pkg/testutil/integration-harness'

test('removes permission by name', async (t) => {
  const h = await IntegrationHarness.init(t)
  const root = await h.createRootKey(['rbac.*.remove_permission_from_key'])

  const { keyId } = await h.createKey()

  const permission = {
    id: newId('test'),
    name: randomUUID(),
    workspaceId: h.resources.userWorkspace.id,
  }

  await h.db.primary.insert(schema.permissions).values(permission)
  await h.db.primary.insert(schema.keysPermissions).values({
    workspaceId: h.resources.userWorkspace.id,
    keyId,
    permissionId: permission.id,
  })

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
          name: permission.name,
        },
      ],
    },
  })

  expect(
    res.status,
    `expected 200, received: ${JSON.stringify(res, null, 2)}`,
  ).toBe(200)

  const key = await h.db.primary.query.keys.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.workspaceId, h.resources.userWorkspace.id),
        eq(table.id, keyId),
      ),
    with: {
      permissions: true,
    },
  })
  expect(key).toBeDefined()
  expect(key!.permissions.length).toBe(0)
})

test('removes permission by id', async (t) => {
  const h = await IntegrationHarness.init(t)
  const root = await h.createRootKey(['rbac.*.remove_permission_from_key'])

  const { keyId } = await h.createKey()

  const permission = {
    id: newId('test'),
    name: randomUUID(),
    workspaceId: h.resources.userWorkspace.id,
  }

  await h.db.primary.insert(schema.permissions).values(permission)
  await h.db.primary.insert(schema.keysPermissions).values({
    workspaceId: h.resources.userWorkspace.id,
    keyId,
    permissionId: permission.id,
  })

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
          id: permission.id,
        },
      ],
    },
  })

  expect(
    res.status,
    `expected 200, received: ${JSON.stringify(res, null, 2)}`,
  ).toBe(200)

  const key = await h.db.primary.query.keys.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.workspaceId, h.resources.userWorkspace.id),
        eq(table.id, keyId),
      ),
    with: {
      permissions: true,
    },
  })
  expect(key).toBeDefined()
  expect(key!.permissions.length).toBe(0)
})

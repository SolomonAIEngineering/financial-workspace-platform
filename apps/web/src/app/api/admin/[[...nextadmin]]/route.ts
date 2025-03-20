import { adminOptions } from '@/app/(dynamic)/(admin)/admin/[[...nextadmin]]/admin-options';
import { createHandler } from '@premieroctet/next-admin/appHandler';
import { prisma } from '@/server/db';
import schema from '@solomonai/prisma/json-schema/json-schema.json';

const { run } = createHandler({
  apiBasePath: '/api/admin',
  options: adminOptions,
  prisma,
  schema,
}) as any;

export { run as DELETE, run as GET, run as POST, run as PUT };

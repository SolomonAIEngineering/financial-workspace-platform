import type { PageProps } from '@/lib/navigation/next-types';

import { NextAdmin } from '@premieroctet/next-admin';
import { getNextAdminProps } from '@premieroctet/next-admin/appRouter';

import { AdminGuard } from '@/components/auth/rsc/auth-redirect';
import { prisma } from '@/server/db';
import { trpc } from '@/trpc/server';

import schema from '../../../../../../prisma/json-schema/json-schema.json';
import { adminOptions } from './admin-options';

export default function Page(props: PageProps) {
  return (
    <AdminGuard>
      <NextAdminPage /* @next-codemod-error 'props' is used with spread syntax (...). Any asynchronous properties of 'props' must be awaited when accessed. */
        {...props}
      />
    </AdminGuard>
  );
}

async function NextAdminPage({ params, searchParams }: PageProps) {
  const currentUser = (await trpc.layout.app()).currentUser;
  const props = await getNextAdminProps({
    apiBasePath: '/api/admin',
    basePath: '/admin',
    options: adminOptions,
    params: (await params).nextadmin,
    prisma,
    schema,
    searchParams: await searchParams,
  });

  return (
    <NextAdmin
      {...props}
      user={{
        data: {
          name: currentUser.name!,
          // picture: currentUser.profileImageUrl!,
        },
      }}
    />
  );
}

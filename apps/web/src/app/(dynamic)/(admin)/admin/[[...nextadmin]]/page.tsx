import { AdminGuard } from '@/components/auth/rsc/auth-redirect';
import { NextAdmin } from '@premieroctet/next-admin';
import type { PageProps } from '@/lib/navigation/next-types';
import { adminOptions } from './admin-options';
import { getNextAdminProps } from '@premieroctet/next-admin/appRouter';
import { prisma } from '@/server/db';
import schema from '@solomonai/prisma/json-schema/json-schema.json';
import { trpc } from '@/trpc/server';

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

'use client';

import Link from 'next/link';

import { useCurrentUser } from '@/components/auth/useCurrentUser';
import { useLogoutMutation } from '@/components/auth/useLogoutMutation';
import { routes } from '@/lib/navigation/routes';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { Button } from '@/registry/default/potion-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/default/potion-ui/dropdown-menu';
import { Spinner } from '@/registry/default/potion-ui/spinner';

import { useAuthGuard } from '../auth/useAuthGuard';
import { pushModal } from '../modals';
import { Icons } from '../ui/icons';
import { Skeleton } from '../ui/skeleton';

export function SidebarSwitcher() {
  const user = useCurrentUser();
  const logout = useLogoutMutation();
  const authGuard = useAuthGuard();

  // Workspace name based on the user's name
  const workspaceName = user.firstName
    ? `${user.firstName}'s Workspace`
    : 'My Workspace';

  if (!user.id) {
    return (
      <div
        className="group mx-2 my-1.5 flex min-h-[32px] items-center gap-2 rounded-md px-2 py-1 pr-0.5 text-sm font-medium text-subtle-foreground hover:bg-primary/[.04]"
        onClick={() => {
          authGuard(() => pushModal('Login'));
        }}
        role="button"
      >
        <div className="px-0.5">
          {user.isLoading ? (
            <Skeleton className="size-4 rounded-sm" />
          ) : (
            <Icons.user variant="muted" className="size-4" />
          )}
        </div>
        {user.isLoading ? <Skeleton className="h-4 w-3/5" /> : 'Sign in'}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="group mx-2 my-1.5 flex min-h-[32px] cursor-pointer items-center gap-2 rounded-md px-2 py-1 pr-0.5 text-sm font-medium hover:bg-primary/[.04]"
          role="button"
        >
          {user.profileImageUrl ? (
            <Avatar className="size-6">
              <AvatarImage
                alt={user.firstName ?? ''}
                src={user.profileImageUrl}
              />
              <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="size-6 bg-background">
              <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
            </Avatar>
          )}

          <span className="line-clamp-1 flex-1 text-start font-medium text-black select-none">
            {workspaceName}
          </span>
          <Icons.chevronDown className="text-muted-foreground/80" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[280px]" align="start" alignOffset={11}>
        <div className="p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {user.profileImageUrl ? (
                  <Avatar className="size-8">
                    <AvatarImage
                      alt={user.firstName ?? ''}
                      src={user.profileImageUrl}
                    />
                    <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="size-8 bg-background">
                    <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="text-sm font-medium">{workspaceName}</p>
                  <p className="text-xs text-muted-foreground">Personal Plan</p>
                </div>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                size="xs"
                variant="outline"
                className="h-8 flex-1 text-xs"
                onClick={() => {
                  authGuard(() => pushModal('Settings'));
                }}
              >
                <Icons.settings className="mr-1 size-3.5" />
                Settings
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="h-8 flex-1 text-xs"
                onClick={() => {
                  authGuard(() => pushModal('Settings'));
                }}
              >
                <Icons.plus className="mr-1 size-3.5" />
                Invite members
              </Button>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="px-3 py-2">
          <p className="px-1 pb-1 text-xs text-muted-foreground">
            {user.email}
          </p>

          <DropdownMenuItem className="my-1 flex items-center gap-2 rounded-md bg-background p-1">
            {user.profileImageUrl ? (
              <Avatar className="size-6">
                <AvatarImage
                  alt={user.firstName ?? ''}
                  src={user.profileImageUrl}
                />
                <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="size-6 bg-background">
                <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <span className="flex-1 text-sm">{workspaceName}</span>
            <Icons.check className="size-4 text-primary" />
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 text-sm">
          <Icons.chevronRight className="size-4" />
          <Link href={routes.account()}>Account</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 px-4 py-4 text-sm font-medium"
          onClick={(e) => {
            e.preventDefault();
            logout.mutate();
          }}
        >
          {logout.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Icons.logout className="size-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

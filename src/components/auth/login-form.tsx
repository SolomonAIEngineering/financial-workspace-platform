'use client';

import { authRoutes, routes } from '@/lib/navigation/routes';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/registry/default/potion-ui/button';
import { CardTitle } from '../ui/card';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { cn } from '@udecode/cn';
import { encodeURL } from '@/lib/url/encodeURL';
import { useQueryState } from 'nuqs';

export function LoginForm({
  displayLogo = true,
  displayTitle = true,
}: {
  displayLogo?: boolean;
  displayTitle?: boolean;
}) {
  let [callbackUrl] = useQueryState('callbackUrl');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!callbackUrl && !authRoutes.includes(pathname as any)) {
    callbackUrl = encodeURL(pathname, searchParams.toString());
  }

  return (
    <div className={cn('mx-auto grid space-y-6')}>
      <div className="flex flex-col gap-2 text-center">
        {displayLogo && (
          <Icons.logo className="mx-auto mb-3 size-10 text-foreground" />
        )}
        {displayTitle && (
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
        )}
        <p className="text-base text-muted-foreground">
          Sign in or create an account to continue
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <a
          className="w-full"
          href={routes.loginProvider({
            provider: 'github',
            search: callbackUrl
              ? {
                callbackUrl,
              }
              : undefined,
          })}
          target="_self"
        >
          <Button
            variant="outline"
            className="h-10 w-full font-medium"
            icon={<Icons.github className="mr-2 size-5" />}
          >
            Continue with GitHub
          </Button>
        </a>

        <a
          className="w-full"
          href={routes.loginProvider({
            provider: 'google',
            search: callbackUrl
              ? {
                callbackUrl,
              }
              : undefined,
          })}
          target="_self"
        >
          <Button
            variant="outline"
            className="h-10 w-full font-medium"
            icon={<Icons.google className="mr-2 size-5" />}
          >
            Continue with Google
          </Button>
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Protected by Solomon AI Contract Workspace
          </span>
        </div>
      </div>

      <div className="px-2">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link
            className="underline underline-offset-4 hover:text-foreground"
            href={routes.terms()}
          >
            Terms of Service
          </Link>{' '}
          and acknowledge you've read our{' '}
          <Link
            className="underline underline-offset-4 hover:text-foreground"
            href={routes.privacy()}
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

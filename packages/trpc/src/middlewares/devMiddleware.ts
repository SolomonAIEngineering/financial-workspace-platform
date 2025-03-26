import { RequestCookie, getCookieNumber } from '../utils/getCookie';

import { CookieNames } from '@solomonai/lib/storage/cookies';
import { sleep } from '@solomonai/lib/utils/sleep';
import { t } from '../trpc';

export const devMiddleware = (key: string) =>
  t.middleware(async ({ ctx, next, path }) => {
    if (!t._config.isDev) {
      return next({ ctx });
    }

    // or t._config.isDev
    const timeout = getCookieNumber(ctx.cookies as unknown as RequestCookie[], CookieNames[key as keyof typeof CookieNames]);

    if (timeout) {
      const start = Date.now();

      // Throws an error for large timeout (e.g. 2000)
      await sleep(timeout);

      const result = await next();

      const end = Date.now();
      console.info(`[TRPC] ${path} took ${end - start}ms to execute`);

      return result;
    }

    return next({ ctx });
  });

import {
  OAuth2RequestError,
  generateCodeVerifier,
  generateState,
} from '@/server/auth/lib';
import { authProviders, lucia } from '@/server/auth/lucia';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import {
  protectedMiddlewares,
  publicMiddlewares,
} from '../middlewares/auth-middleware';

import { Hono } from 'hono';
import { env } from '@/env';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const authRoutes = new Hono()
  .get(
    '/:provider/login',
    ...publicMiddlewares(),
    zValidator('param', z.object({ provider: z.enum(['github', 'google']) })),
    zValidator(
      'query',
      z.object({ callbackUrl: z.string().optional() }).optional()
    ),
    async (c) => {
      const { provider } = c.req.param();
      const { callbackUrl } = c.req.query();

      const state = generateState();
      const currentProvider = authProviders[provider];

      let codeVerifier: string | undefined;

      if (currentProvider.config.pkce) {
        codeVerifier = generateCodeVerifier();
      }

      const url = await currentProvider.getProviderAuthorizationUrl(
        state,
        codeVerifier
      );

      setCookie(c, 'oauth_state', state, {
        httpOnly: true,
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      });

      if (codeVerifier) {
        setCookie(c, 'code_verifier', codeVerifier, {
          httpOnly: true,
          maxAge: 60 * 60,
          path: '/',
          secure: env.NODE_ENV === 'production',
        });
      }
      if (callbackUrl) {
        setCookie(c, 'callback_url', callbackUrl, {
          maxAge: 60 * 60,
        });
      } else {
        deleteCookie(c, 'callback_url');
      }

      return c.redirect(url.toString());
    }
  )
  .get(
    '/:provider/callback',
    ...publicMiddlewares(),
    zValidator('param', z.object({ provider: z.enum(['github', 'google']) })),
    async (c) => {
      const { provider } = c.req.param();

      const currentProvider = authProviders[provider];

      const code = c.req.query('code');
      const state = c.req.query('state');
      const storedState = getCookie(c, 'oauth_state');
      let callbackUrl = getCookie(c, 'callback_url');

      if (callbackUrl) {
        callbackUrl = decodeURIComponent(callbackUrl);
      }

      let storedCodeVerifier: string | null = null;

      if (currentProvider.config.pkce) {
        storedCodeVerifier = getCookie(c, 'code_verifier') ?? null;
      }
      if (
        !code ||
        !state ||
        !storedState ||
        state !== storedState ||
        (currentProvider.config.pkce && !storedCodeVerifier)
      ) {
        return c.json({ error: 'Token mismatch' }, 400);
      }

      try {
        const userId = await currentProvider.handleProviderCallback(
          code,
          storedCodeVerifier!,
          c.get('user')?.id
        );

        // Link account (already logged in)
        if (!userId) {
          return c.redirect('/settings');
        }

        const session = await lucia.createSession(userId, {
          ip_address: c.req.header('X-Forwarded-For') ?? '127.0.0.1',
          user_agent: c.req.header('User-Agent') || null,
        });
        const sessionCookie = lucia.createSessionCookie(session.id);
        setCookie(c, sessionCookie.name, sessionCookie.value, {
          ...sessionCookie.attributes,
          maxAge: 60 * 60 * 24 * 30,
        });

        // Clean up temporary cookies
        deleteCookie(c, 'oauth_state');
        deleteCookie(c, 'code_verifier');
        deleteCookie(c, 'callback_url');

        return c.redirect(callbackUrl ?? '/settings');
      } catch (error) {
        if (error instanceof OAuth2RequestError) {
          return c.json({ error: error.message }, 400);
        }

        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  )
  .post('/logout', ...protectedMiddlewares(), async (c) => {
    const session = c.get('session');

    if (session) {
      await lucia.invalidateSession(session.id);
      const sessionCookie = lucia.createBlankSessionCookie();
      setCookie(
        c,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    return c.json({ success: true });
  });
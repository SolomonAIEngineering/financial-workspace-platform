import type { InferResponseType } from 'hono';
import { encodeURL } from '@/lib/url/encodeURL';
import { env } from '@/env';
import { honoApi } from '@/server/hono/hono-client';
import { routes } from '@/lib/navigation/routes';
import { useMutation } from '@tanstack/react-query';

const $post = honoApi.auth.logout.$post;

export const useLogoutMutation = () => {
  return useMutation<InferResponseType<typeof $post>>({
    mutationFn: async () => {
      const res = await $post();

      return await res.json();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
    onSuccess: () => {
      window.location.href =
        routes.home() +
        `?callbackUrl=${encodeURL(window.location.pathname, window.location.search)}`;
    },
  });
};

export const useInvalidateSessionMutation = () => {
  return useMutation<InferResponseType<typeof $post>>({
    mutationFn: async () => {
      const logCookieDebug = (phase: string) => {
        if (env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
          console.debug(`[Cookie Debug - ${phase}]`, document.cookie);
        }
      };

      logCookieDebug('Before logout');
      console.log('Starting session invalidation');

      // For HTTP-only cookies, we need to rely on the server to clear them
      // The $post() call should hit the server endpoint that clears cookies
      const res = await $post();

      logCookieDebug('After server response');

      // Try client-side cookie clearing as a fallback for non-HTTP-only cookies
      // Note: This won't work for HTTP-only cookies
      try {
        // Get current domain to handle domain-specific cookies
        const domain = window.location.hostname;

        // Get all cookies
        const cookies = document.cookie.split(';');
        logCookieDebug(`Cookies to clear: ${cookies.length}`);

        // Clear all cookies regardless of path, focusing only on domain
        cookies.forEach((cookie) => {
          const [name] = cookie.trim().split('=');
          if (!name) return;

          // Clear with no domain specification (root domain)
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

          // Clear with domain specification
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;

          // Also try with a leading dot (for subdomain cookies)
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;

          // For handling parent domains in subdomains
          if (domain.split('.').length > 2) {
            const parentDomain = domain.split('.').slice(1).join('.');
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parentDomain};`;
          }
        });

        logCookieDebug('After client-side clearing');
      } catch (e) {
        console.error('Failed to clear cookies via client-side:', e);
      }

      // Clear all localStorage items
      try {
        localStorage.clear();
        console.info('All localStorage items cleared');
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }

      // Clear sessionStorage as well
      try {
        sessionStorage.clear();
        console.info('All sessionStorage items cleared');
      } catch (e) {
        console.error('Failed to clear sessionStorage:', e);
      }

      return await res.json();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
    onSuccess: () => {
      console.log('Session invalidated successfully');
    },
  });
};

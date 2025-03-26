import { AnyZodObject, ZodError } from 'zod';
import { AppError, genericErrorCodeToTrpcErrorCodeMap } from '@solomonai/lib/errors/app-error';

import { TrpcContext } from './context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

// Can't import type from trpc-to-openapi because it breaks nextjs build, not sure why.
type OpenApiMeta = {
  openapi?: {
    enabled?: boolean;
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: `/${string}`;
    summary?: string;
    description?: string;
    protect?: boolean;
    tags?: string[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    contentTypes?: ('application/json' | 'application/x-www-form-urlencoded' | (string & {}))[];
    deprecated?: boolean;
    requestHeaders?: AnyZodObject;
    responseHeaders?: AnyZodObject;
    successDescription?: string;
    errorResponses?: number[] | Record<number, string>;
  };
} & Record<string, unknown>;

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
export const t = initTRPC
  .meta<OpenApiMeta>()
  .context<TrpcContext>()
  .create({
    transformer: superjson,
    errorFormatter({ error, shape }) {
      const originalError = error.cause;

      let data: Record<string, unknown> = shape.data;

      // Default unknown errors to 400, since if you're throwing an AppError it is expected
      // that you already know what you're doing.
      if (originalError instanceof AppError) {
        data = {
          ...data,
          appError: AppError.toJSON(originalError),
          code: originalError.code,
          httpStatus:
            originalError.statusCode ??
            genericErrorCodeToTrpcErrorCodeMap[originalError.code]?.status ??
            400,
        };
      }

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * Create a server-side caller
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createRouter = t.router;

export const mergeRouters = t.mergeRouters;

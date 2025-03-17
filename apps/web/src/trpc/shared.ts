import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/server/api/root';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>; 
import { Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';

import type { DB } from '@solomonai/prisma/kysely/types';
import { pgPool } from '@/server/pg';

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
  log: process.env.NODE_ENV === 'development' ? ['error'] : undefined,
  plugins: [new ParseJSONResultsPlugin()],
});

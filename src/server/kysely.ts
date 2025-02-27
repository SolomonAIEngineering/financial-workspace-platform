import { Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';

import { pgPool } from '@/server/pg';

import type { DB } from '../../prisma/kysely/types';

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
  log: process.env.NODE_ENV === 'development' ? ['error'] : undefined,
  plugins: [new ParseJSONResultsPlugin()],
});

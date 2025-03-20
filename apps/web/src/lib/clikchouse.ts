import { ClickHouse } from '@solomonai/clickhouse-financials';

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL,
});

export default clickhouse;

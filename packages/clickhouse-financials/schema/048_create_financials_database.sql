-- +goose up

CREATE DATABASE IF NOT EXISTS financials;

-- +goose down
DROP DATABASE financials; 
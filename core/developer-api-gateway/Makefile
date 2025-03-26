.PHONY: up down restart clean test test-integration test-unit db-check all help

# Default target
all: up test

# Help command
help:
	@echo "Available commands:"
	@echo "  make up               - Start Docker containers"
	@echo "  make down             - Stop Docker containers"
	@echo "  make restart          - Restart Docker containers"
	@echo "  make clean            - Clean all Docker volumes and restart containers"
	@echo "  make test             - Run all tests"
	@echo "  make test-unit        - Run unit tests"
	@echo "  make test-integration - Run integration tests"
	@echo "  make db-check         - Check database connection"
	@echo "  make all              - Start containers and run all tests"
	@echo "  make help             - Show this help message"

# Docker commands
up:
	@echo "Starting Docker containers..."
	DATABASE_PORT=3900 npm run test:docker:up
	@echo "Waiting for database to be ready..."
	@sleep 5

down:
	@echo "Stopping Docker containers..."
	npm run test:docker:down

restart:
	@echo "Restarting Docker containers..."
	DATABASE_PORT=3900 npm run test:docker:restart
	@echo "Waiting for database to be ready..."
	@sleep 5

clean:
	@echo "Cleaning Docker volumes and restarting containers..."
	DATABASE_PORT=3900 npm run test:docker:clean
	@echo "Waiting for database to be ready..."
	@sleep 5

# Database check
db-check:
	@echo "Checking database connection..."
	@if nc -z localhost 3900; then \
		echo "Database is up and running on port 3900"; \
	else \
		echo "ERROR: Database is not running on port 3900"; \
		echo "Run 'make up' to start the database"; \
		exit 1; \
	fi

# Test commands
test: db-check
	@echo "Running all tests..."
	DATABASE_PORT=3900 npm run test

test-unit: db-check
	@echo "Running unit tests..."
	DATABASE_PORT=3900 npm run test:docker:restart && DATABASE_PORT=3900 npx vitest run -c vitest.unit.ts

test-integration: db-check
	@echo "Running integration tests..."
	DATABASE_PORT=3900 npm run test:integration
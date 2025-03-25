.PHONY: install dev build start migrate db-reset db-seed db-studio analyze lint typecheck help local docker-clean docker-clean-dangling

# Default target
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev         - Start development server with database"
	@echo "  make build       - Build the application"
	@echo "  make start       - Start production server"
	@echo "  make migrate     - Run database migrations"
	@echo "  make db-reset    - Reset database"
	@echo "  make db-seed     - Seed database"
	@echo "  make db-studio   - Open Prisma Studio"
	@echo "  make analyze     - Analyze bundle"
	@echo "  make lint        - Run linter"
	@echo "  make typecheck   - Run TypeScript checks"
	@echo "  make local       - Setup and run local development environment"
	@echo "  make docker-clean - Remove all Docker images forcefully"
	@echo "  make docker-clean-dangling - Remove only unused Docker images"

install:
	pnpm install

dev:
	pnpm run dev

build:
	pnpm run build

start:
	pnpm run start

migrate:
	pnpm run migrate

db-reset:
	pnpm run db:reset

db-seed:
	pnpm run db:seed

db-studio:
	pnpm run db:studio

analyze:
	pnpm run analyze

lint:
	pnpm run lint

typecheck:
	pnpm run typecheck

local:
	@echo "Setting up local development environment..."
	@echo "1. Installing dependencies..."
	pnpm install
	@echo "2. Starting development server..."
	pnpm dev & \
	@echo "3. Running database migrations in separate process..."
	pnpm migrate

docker-clean:
	@echo "Stopping all running containers..."
	docker stop $$(docker ps -q) || true
	@echo "Removing all containers..."
	docker rm $$(docker ps -a -q) || true
	@echo "Removing all Docker images..."
	docker rmi $$(docker images -q) -f || true

docker-clean-dangling:
	@echo "Removing unused Docker images..."
	docker image prune -a -f || true

clean: docker-clean docker-clean-dangling
package routes

import (
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/caches"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/keys"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/permissions"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/ratelimit"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/clickhouse/schema"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/db"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/otel/logging"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/zen/validation"
)

type EventBuffer interface {
	BufferApiRequest(schema.ApiRequestV1)
}

type Services struct {
	Logger      logging.Logger
	Database    db.Database
	EventBuffer EventBuffer
	Keys        keys.KeyService
	Permissions permissions.PermissionService
	Validator   *validation.Validator
	Ratelimit   ratelimit.Service
	Caches      caches.Caches
}

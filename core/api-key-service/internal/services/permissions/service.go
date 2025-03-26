package permissions

import (
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/cache"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/clock"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/db"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/otel/logging"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/rbac"
)

type service struct {
	db     db.Database
	logger logging.Logger
	rbac   *rbac.RBAC

	// keyId -> permissions
	cache cache.Cache[string, []string]
}

var _ PermissionService = (*service)(nil)

type Config struct {
	DB     db.Database
	Logger logging.Logger
	Clock  clock.Clock
	Cache  cache.Cache[string, []string]
}

func New(config Config) (*service, error) {

	return &service{
		db:     config.DB,
		logger: config.Logger,
		rbac:   rbac.New(),
		cache:  config.Cache,
	}, nil
}

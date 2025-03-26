package permissions

import (
	"context"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/rbac"
)

type PermissionService interface {
	Check(ctx context.Context, keyId string, query rbac.PermissionQuery) (rbac.EvaluationResult, error)
}

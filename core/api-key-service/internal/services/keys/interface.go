package keys

import (
	"context"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/zen"
)

type KeyService interface {
	Verify(ctx context.Context, hash string) (VerifyResponse, error)
	VerifyRootKey(ctx context.Context, sess *zen.Session) (VerifyResponse, error)
}

type VerifyResponse struct {
	AuthorizedWorkspaceID string
	KeyID                 string
}

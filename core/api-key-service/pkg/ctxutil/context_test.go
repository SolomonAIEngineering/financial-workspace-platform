package ctxutil_test

import (
	"context"
	"testing"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/ctxutil"
	"github.com/stretchr/testify/require"
)

func TestRequestIDContextFunctions(t *testing.T) {
	// Test setting and getting request ID
	requestID := "test-request-id-123"
	ctx := context.Background()

	// Test with empty context
	emptyID := ctxutil.GetRequestId(ctx)
	require.Empty(t, emptyID)

	// Test setting and retrieving
	ctx = ctxutil.SetRequestId(ctx, requestID)
	retrievedID := ctxutil.GetRequestId(ctx)
	require.Equal(t, requestID, retrievedID)

	// Test overwriting
	newRequestID := "new-request-id-456"
	ctx = ctxutil.SetRequestId(ctx, newRequestID)
	retrievedID = ctxutil.GetRequestId(ctx)
	require.Equal(t, newRequestID, retrievedID)
}

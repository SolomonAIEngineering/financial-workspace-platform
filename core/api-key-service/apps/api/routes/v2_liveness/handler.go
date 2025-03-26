package v2Liveness

import (
	"context"
	"net/http"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/apps/api/openapi"
	zen "github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/zen"
)

type Response = openapi.V2LivenessResponseBody

func New() zen.Route {
	return zen.NewRoute("GET", "/v2/liveness", func(ctx context.Context, s *zen.Session) error {

		res := Response{
			Message: "we're cooking",
		}
		return s.JSON(http.StatusOK, res)
	})
}

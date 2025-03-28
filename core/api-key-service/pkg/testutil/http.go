package testutil

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/caches"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/keys"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/permissions"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/internal/services/ratelimit"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/clock"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/cluster"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/db"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/otel/logging"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/testutil/containers"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/testutil/seed"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/zen"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/zen/validation"
	"github.com/stretchr/testify/require"
)

type Harness struct {
	t *testing.T

	Clock *clock.TestClock

	srv        *zen.Server
	containers *containers.Containers
	validator  *validation.Validator

	middleware []zen.Middleware

	DB          db.Database
	Caches      caches.Caches
	Logger      logging.Logger
	Keys        keys.KeyService
	Permissions permissions.PermissionService
	Ratelimit   ratelimit.Service
	seeder      *seed.Seeder
}

func NewHarness(t *testing.T) *Harness {
	clk := clock.NewTestClock()

	logger := logging.New()

	cont := containers.New(t)

	dsn, _ := cont.RunMySQL()

	db, err := db.New(db.Config{
		Logger:      logger,
		PrimaryDSN:  dsn,
		ReadOnlyDSN: "",
	})
	require.NoError(t, err)

	caches, err := caches.New(caches.Config{
		Logger: logger,
		Clock:  clk,
	})
	require.NoError(t, err)

	srv, err := zen.New(zen.Config{
		InstanceID: "test",
		Logger:     logger,
	})
	require.NoError(t, err)

	keyService, err := keys.New(keys.Config{
		Logger:   logger,
		DB:       db,
		Clock:    clk,
		KeyCache: caches.KeyByHash,
	})
	require.NoError(t, err)

	validator, err := validation.New()
	require.NoError(t, err)

	permissionService, err := permissions.New(permissions.Config{
		DB:     db,
		Logger: logger,
		Clock:  clk,
		Cache:  caches.PermissionsByKeyId,
	})
	require.NoError(t, err)

	ratelimitService, err := ratelimit.New(ratelimit.Config{
		Logger:  logger,
		Cluster: cluster.NewNoop("test", "localhost"),
		Clock:   clk,
	})
	require.NoError(t, err)

	// Create seeder
	seeder := seed.New(t, db)

	// Seed the database
	seeder.Seed(context.Background())

	h := Harness{
		t:           t,
		Logger:      logger,
		srv:         srv,
		containers:  cont,
		validator:   validator,
		Keys:        keyService,
		Permissions: permissionService,
		Ratelimit:   ratelimitService,
		DB:          db,
		seeder:      seeder,
		Clock:       clk,
		Caches:      caches,

		middleware: []zen.Middleware{
			zen.WithTracing(),
			zen.WithLogging(logger),
			zen.WithErrorHandling(logger),
			zen.WithValidation(validator),
		},
	}

	return &h
}

// Register registers a route with the harness.
// You can override the middleware by passing a list of middleware.
func (h *Harness) Register(route zen.Route, middleware ...zen.Middleware) {
	if len(middleware) == 0 {
		middleware = h.middleware
	}

	h.srv.RegisterRoute(
		middleware,
		route,
	)
}

// CreateRootKey creates a root key with the specified permissions
func (h *Harness) CreateRootKey(workspaceID string, permissions ...string) string {
	return h.seeder.CreateRootKey(context.Background(), workspaceID, permissions...)
}

func (h *Harness) Resources() seed.Resources {
	return h.seeder.Resources
}

type TestResponse[TBody any] struct {
	Status  int
	Headers http.Header
	Body    *TBody
	RawBody string
}

func CallRoute[Req any, Res any](h *Harness, route zen.Route, headers http.Header, req Req) TestResponse[Res] {
	h.t.Helper()

	rr := httptest.NewRecorder()

	body := new(bytes.Buffer)
	err := json.NewEncoder(body).Encode(req)
	require.NoError(h.t, err)

	httpReq := httptest.NewRequest(route.Method(), route.Path(), body)
	httpReq.Header = headers
	if httpReq.Header == nil {
		httpReq.Header = http.Header{}
	}

	h.srv.Mux().ServeHTTP(rr, httpReq)
	require.NoError(h.t, err)

	rawBody := rr.Body.Bytes()

	res := TestResponse[Res]{
		Status:  rr.Code,
		Headers: rr.Header(),
		RawBody: string(rawBody),
		Body:    nil,
	}

	var responseBody Res
	err = json.Unmarshal(rawBody, &responseBody)
	require.NoError(h.t, err)

	res.Body = &responseBody

	return res
}

// UnmarshalBody is a helper function to unmarshal the response body
func UnmarshalBody[Body any](t *testing.T, r *httptest.ResponseRecorder, body *Body) {
	err := json.Unmarshal(r.Body.Bytes(), &body)
	require.NoError(t, err)
}

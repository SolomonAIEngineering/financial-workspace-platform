FROM golang:1.24.0 AS builder

WORKDIR /go/src/github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service
COPY go.sum go.mod ./
RUN go mod download

COPY . .
ARG VERSION
ENV CGO_ENABLED=0
RUN go build -o bin/unkey -ldflags="-X 'github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/version.Version=${VERSION}'" ./main.go

FROM gcr.io/distroless/static-debian12:v1.0.0
COPY --from=builder /go/src/github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/bin/unkey /

LABEL org.opencontainers.image.source=https://github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service
LABEL org.opencontainers.image.description="Unkey API"

ENTRYPOINT  ["/unkey"]

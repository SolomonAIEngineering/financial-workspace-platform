package main

import (
	"context"
	"fmt"
	"os"

	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/cmd/api"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/cmd/healthcheck"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/cmd/quotacheck"
	"github.com/SolomonAIEngineering/financial-workspace-platform/core/api-key-service/pkg/version"
	"github.com/urfave/cli/v3"
)

func main() {
	app := &cli.Command{
		Name:    "unkey",
		Usage:   "Run unkey ",
		Version: version.Version,

		Commands: []*cli.Command{
			api.Cmd,
			healthcheck.Cmd,
			quotacheck.Cmd,
		},
	}

	err := app.Run(context.Background(), os.Args)
	if err != nil {
		fmt.Println()
		fmt.Println()
		fmt.Println(err.Error())
		fmt.Println()
		os.Exit(1)
	}
}

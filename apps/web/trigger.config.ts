import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
    project: process.env.TRIGGER_PROJECT_ID!,

    // Runtime configuration
    runtime: "node",
    logLevel: "info",
    maxDuration: 900, // 15 minutes

    // Retry configuration
    retries: {
        enabledInDev: false,
        default: {
            maxAttempts: 3,
            minTimeoutInMs: 1000,
            maxTimeoutInMs: 10000,
            factor: 2,
            randomize: true,
        },
    },

    // Build configuration
    build: {
        external: [],
    },

    // Directory configuration
    dirs: ["./src/jobs/tasks"],
}); 
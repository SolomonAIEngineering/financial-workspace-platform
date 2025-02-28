import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
    id: "smb-financial-management-platform",

    // The Trigger.dev API URL
    apiUrl: process.env.TRIGGER_API_URL || "https://api.trigger.dev",

    // Your API key
    apiKey: process.env.TRIGGER_API_KEY || "",

    // Runtime configuration
    runtime: "node",
    logLevel: "info",
    maxDuration: 540, // 9 minutes

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
    dirs: ["./src/jobs/examples"],
}); 
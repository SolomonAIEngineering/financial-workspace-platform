import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
    project: 'proj_ytxnlllaekcwwlbxxqya',

    // Runtime configuration
    runtime: 'node',
    logLevel: 'log',
    maxDuration: 3600, // 15 minutes

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
        external: ['sharp'],
        extensions: [
            prismaExtension({
                schema: '../../packages/prisma/schema.prisma',
                clientGenerator: 'client',
            }),
        ],
    },
    dirs: ["./src/tasks"],
});
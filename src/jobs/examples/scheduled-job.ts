import { CronTrigger } from "@trigger.dev/sdk";
import { client } from "../client";

/**
 * This is an example of a scheduled job that runs every day at midnight
 * It demonstrates how to use the Trigger.dev SDK to create scheduled jobs
 */
client.defineJob({
    id: "scheduled-example-job",
    name: "Scheduled Example Job",
    version: "0.0.1",
    trigger: new CronTrigger({
        cron: "0 0 * * *" // Run at midnight every day (cron syntax)
    }),
    run: async (payload, io, ctx) => {
        await io.logger.info("Running scheduled job", { timestamp: new Date().toISOString() });

        // Your job logic goes here
        // For example, you could sync data, send notifications, etc.

        return {
            message: "Scheduled job completed successfully",
            timestamp: new Date().toISOString(),
        };
    },
}); 
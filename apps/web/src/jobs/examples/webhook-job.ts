import { client } from "../client";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";

/**
 * This is an example of a webhook job that can be triggered via HTTP
 * It demonstrates how to use the Trigger.dev SDK to create webhook jobs
 */
client.defineJob({
    id: "webhook-example-job",
    name: "Webhook Example Job",
    version: "0.0.1",
    trigger: eventTrigger({
        name: "webhook.received",
        schema: z.object({
            userId: z.string(),
            action: z.string(),
            data: z.record(z.any()).optional(),
        }),
    }),
    run: async (payload, io, ctx) => {
        await io.logger.info("Webhook triggered", {
            userId: payload.userId,
            action: payload.action,
            timestamp: new Date().toISOString()
        });

        // Your webhook handling logic goes here
        // For example, you could process a payment, update a user, etc.

        return {
            message: "Webhook processed successfully",
            userId: payload.userId,
            action: payload.action,
            timestamp: new Date().toISOString(),
        };
    },
}); 
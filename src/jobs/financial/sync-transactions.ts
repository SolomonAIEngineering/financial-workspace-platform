import { client } from "../client";

/**
 * This job syncs bank transactions daily at midnight
 */
client.defineJob({
    id: "sync-bank-transactions",
    name: "Sync Bank Transactions",
    version: "0.0.1",
    trigger: {
        schedule: "0 0 * * *" // Run at midnight every day
    },
    run: async (payload, io, ctx) => {
        await io.logger.info("Starting bank transaction sync", { timestamp: new Date().toISOString() });

        // Here you would add code to:
        // 1. Fetch all active bank connections
        // 2. For each connection, call the Plaid API to get new transactions
        // 3. Store the transactions in your database
        // 4. Update last sync timestamps

        await io.logger.info("Bank transaction sync completed", { timestamp: new Date().toISOString() });

        return {
            message: "Bank transaction sync completed successfully",
            timestamp: new Date().toISOString(),
        };
    },
}); 
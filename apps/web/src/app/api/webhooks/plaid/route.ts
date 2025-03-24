import { syncConnectionJob } from "@/jobs";
import { prisma } from "@/server/db";
import { isAfter, subDays } from "date-fns";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Plaid Webhook Handler
 * 
 * This module implements a secure API route to handle incoming webhooks from Plaid.
 * It processes transaction updates, validates webhook payloads, and triggers 
 * synchronization jobs for linked bank accounts.
 * 
 * @see https://plaid.com/docs/api/webhooks/ - Plaid Webhook Documentation
 */

/**
 * List of allowed Plaid IPs for webhook calls
 * This is a security measure to ensure that only legitimate Plaid servers can send webhooks.
 * 
 * @see https://plaid.com/docs/api/webhooks/#configuring-webhooks
 */
const ALLOWED_IPS = [
  "52.21.26.131",
  "52.21.47.157",
  "52.41.247.19",
  "52.88.82.239",
];

/**
 * Schema for validating Plaid webhook payloads
 * 
 * Defines the expected structure of Plaid's transaction webhooks:
 * - webhook_type: Type of webhook (currently only supporting TRANSACTIONS)
 * - webhook_code: Specific event code that triggered the webhook
 *   - SYNC_UPDATES_AVAILABLE: New transaction data is available for sync
 *   - HISTORICAL_UPDATE: Historical transactions sync has completed
 *   - DEFAULT_UPDATE: Regular transaction updates are available
 *   - TRANSACTIONS_REMOVED: Previously synced transactions have been removed
 *   - INITIAL_UPDATE: First update of transaction data is available
 * - item_id: Unique identifier for the Plaid Item associated with the webhook
 * - error: Optional error object when webhook indicates an error state
 * - new_transactions: Number of new transactions available (optional)
 * - environment: Indicates if webhook is from sandbox or production
 * 
 * @see https://plaid.com/docs/api/webhooks/#transactions-webhooks
 */
const webhookSchema = z.object({
  webhook_type: z.enum(["TRANSACTIONS"]),
  webhook_code: z.enum([
    "SYNC_UPDATES_AVAILABLE",
    "HISTORICAL_UPDATE",
    "DEFAULT_UPDATE",
    "TRANSACTIONS_REMOVED",
    "INITIAL_UPDATE",
  ]),
  item_id: z.string(),
  error: z
    .object({
      error_type: z.string(),
      error_code: z.string(),
      error_code_reason: z.string(),
      error_message: z.string(),
      display_message: z.string(),
      request_id: z.string(),
      causes: z.array(z.string()),
      status: z.number(),
    })
    .nullable(),
  new_transactions: z.number().optional(),
  environment: z.enum(["sandbox", "production"]),
});

/**
 * POST handler for Plaid webhooks
 * 
 * This function processes incoming webhook events from Plaid and triggers appropriate actions:
 * 1. Validates the request comes from an authorized Plaid IP address
 * 2. Parses and validates the webhook payload using zod schema
 * 3. Finds the associated bank connection by Plaid Item ID
 * 4. Processes transaction-related webhook events:
 *    - For SYNC_UPDATES_AVAILABLE, DEFAULT_UPDATE, INITIAL_UPDATE: 
 *      Triggers a standard sync job
 *    - For HISTORICAL_UPDATE: Determines if manual sync is needed 
 *      (based on connection age) and triggers appropriate sync
 * 
 * @param req - Next.js request object containing the webhook payload
 * @returns NextResponse with appropriate status and message
 * 
 * @see https://plaid.com/docs/api/webhooks/#transactions-sync_updates_available
 */
export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || "";

  // Security check: Ensure webhook is coming from Plaid's IP addresses
  if (!ALLOWED_IPS.includes(clientIp)) {
    return NextResponse.json(
      { error: "Unauthorized IP address" },
      { status: 403 },
    );
  }

  const body = await req.json();

  // Validate webhook payload against schema
  const result = webhookSchema.safeParse(body);

  if (!result.success) {
    console.error("Invalid plaid webhook payload", {
      details: result.error.issues,
    });

    return NextResponse.json(
      { error: "Invalid webhook payload", details: result.error.issues },
      { status: 400 },
    );
  }

  // Find the bank connection associated with this Plaid Item
  const connectionData = await prisma.bankConnection.findUnique({
    where: {
      itemId: result.data.item_id,
    },
  });

  if (!connectionData) {
    return NextResponse.json(
      { error: "Connection not found" },
      { status: 404 },
    );
  }

  // Process transaction-related webhooks
  if (result.data.webhook_type === "TRANSACTIONS") {
    switch (result.data.webhook_code) {
      case "SYNC_UPDATES_AVAILABLE":
      case "DEFAULT_UPDATE":
      case "INITIAL_UPDATE":
      case "HISTORICAL_UPDATE": {
        // For HISTORICAL_UPDATE, we only trigger manual sync if the connection is recent (< 24h)
        // This optimizes the sync process for newly added connections
        const manualSync =
          result.data.webhook_code === "HISTORICAL_UPDATE" &&
          isAfter(new Date(connectionData.createdAt), subDays(new Date(), 1));

        console.info("Triggering sync job", {
          connectionId: connectionData.id,
          manualSync,
          webhookCode: result.data.webhook_code,
        });

        // Trigger the sync job with appropriate parameters
        await syncConnectionJob.trigger({
          connectionId: connectionData.id,
          manualSync,
        });

        break;
      }
    }
  }

  return NextResponse.json({ success: true });
}

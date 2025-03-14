import { EnrichmentService } from "../../utils/enrichment-service";
import { prisma } from "@/server/db";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const enrichTransactions = schemaTask({
  id: "enrich-transactions",
  schema: z.object({
    transactions: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ transactions }) => {

    const enrichmentService = new EnrichmentService();

    const data = await enrichmentService.batchEnrichTransactions(transactions);

    // Update the transactions with enriched data
    // Using updateMany since we're updating multiple records
    await prisma.transaction.updateMany({
      where: {
        id: {
          in: data.map((t) => t.id)
        }
      },
      data: {
        categorySlug: data.map((t) => t.category_slug).join(','),
      },
    });
  },
});

import {
  require_date_fns
} from "../../../../../../../../../../../chunk-HCZ7FCOM.mjs";
import {
  prisma
} from "../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  cronTrigger
} from "../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/transactions/analyze-spending.ts
init_esm();
var import_date_fns = __toESM(require_date_fns(), 1);
var analyzeSpendingJob = client.defineJob({
  id: "analyze-spending-patterns-job",
  name: "Analyze Spending Patterns",
  trigger: cronTrigger({
    cron: "0 2 * * *"
    // Every day at 2 AM
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting spending pattern analysis");
    const activeUsers = await io.runTask("get-active-users", async () => {
      return await prisma.user.findMany({
        select: {
          id: true
        },
        take: 100,
        // Process in batches
        where: {
          transactions: {
            some: {
              date: {
                gte: (0, import_date_fns.subMonths)(/* @__PURE__ */ new Date(), 3)
                // Active in last 3 months
              }
            }
          }
        }
      });
    });
    await io.logger.info(`Found ${activeUsers.length} active users to analyze`);
    return {
      usersAnalyzed: activeUsers.length
    };
  }
});
export {
  analyzeSpendingJob
};
//# sourceMappingURL=analyze-spending.mjs.map

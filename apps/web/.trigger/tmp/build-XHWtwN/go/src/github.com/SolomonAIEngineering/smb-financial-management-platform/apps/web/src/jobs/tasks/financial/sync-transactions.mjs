import {
  client,
  cronTrigger
} from "../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  init_esm
} from "../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/financial/sync-transactions.ts
init_esm();
client.defineJob({
  id: "sync-bank-transactions",
  name: "Sync Bank Transactions",
  version: "0.0.1",
  trigger: cronTrigger({
    cron: "0 0 * * *"
    // Run at midnight every day
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Starting bank transaction sync", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    await io.logger.info("Bank transaction sync completed", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      message: "Bank transaction sync completed successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
//# sourceMappingURL=sync-transactions.mjs.map

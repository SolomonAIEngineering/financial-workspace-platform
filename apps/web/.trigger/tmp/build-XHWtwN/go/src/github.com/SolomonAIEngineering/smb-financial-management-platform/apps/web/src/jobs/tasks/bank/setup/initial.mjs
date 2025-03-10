import {
  getAccounts,
  getInstitutionById
} from "../../../../../../../../../../../../chunk-LRH2TIVL.mjs";
import {
  prisma,
  require_default
} from "../../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  eventTrigger
} from "../../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/setup/initial.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var initialSetupJob = client.defineJob({
  id: "initial-setup-job",
  name: "Initial Bank Connection Setup",
  trigger: eventTrigger({
    name: "initial-setup"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { accessToken, institutionId, itemId, publicToken, userId } = payload;
    await io.logger.info(
      `Starting initial setup for institution ${institutionId}`
    );
    try {
      const institution = await io.runTask("get-institution", async () => {
        return await getInstitutionById(institutionId);
      });
      const bankConnection = await io.runTask(
        "create-bank-connection",
        async () => {
          return await prisma.bankConnection.create({
            data: {
              accessToken,
              createdAt: /* @__PURE__ */ new Date(),
              institutionId,
              institutionName: institution.name,
              itemId,
              // Required field
              lastSyncedAt: /* @__PURE__ */ new Date(),
              logo: institution.logo,
              primaryColor: institution.primaryColor,
              status: import_client.BankConnectionStatus.ACTIVE,
              updatedAt: /* @__PURE__ */ new Date(),
              userId
            }
          });
        }
      );
      const plaidAccounts = await io.runTask("get-plaid-accounts", async () => {
        return await getAccounts(accessToken);
      });
      await io.logger.info(`Found ${plaidAccounts.length} accounts`);
      const bankAccounts = await io.runTask(
        "create-bank-accounts",
        async () => {
          const accounts = [];
          for (const plaidAccount of plaidAccounts) {
            const account = await prisma.bankAccount.create({
              data: {
                availableBalance: plaidAccount.availableBalance,
                bankConnectionId: bankConnection.id,
                createdAt: /* @__PURE__ */ new Date(),
                currentBalance: plaidAccount.currentBalance,
                enabled: true,
                isoCurrencyCode: plaidAccount.isoCurrencyCode,
                limit: plaidAccount.limit,
                mask: plaidAccount.mask,
                name: plaidAccount.name,
                officialName: plaidAccount.officialName,
                plaidAccountId: plaidAccount.plaidAccountId,
                status: import_client.AccountStatus.ACTIVE,
                subtype: plaidAccount.subtype,
                type: mapPlaidAccountType(
                  plaidAccount.type,
                  plaidAccount.subtype
                ),
                updatedAt: /* @__PURE__ */ new Date(),
                userId
              }
            });
            accounts.push(account);
          }
          return accounts;
        }
      );
      await io.logger.info(`Created ${bankAccounts.length} bank accounts`);
      let delayCounter = 0;
      for (const account of bankAccounts) {
        await client.sendEvent({
          // Add a context with delay information instead of using delay property
          context: {
            delaySeconds: delayCounter * 5
          },
          name: "sync-account-trigger",
          payload: {
            accessToken,
            bankAccountId: account.id,
            manualSync: true,
            // Force sync even for accounts that might have issues
            userId
          }
        });
        delayCounter++;
      }
      await prisma.userActivity.create({
        data: {
          detail: `Connected ${institution.name} with ${bankAccounts.length} accounts`,
          metadata: {
            accountCount: bankAccounts.length,
            bankConnectionId: bankConnection.id
          },
          type: "ACCOUNT_CONNECTED",
          userId
        }
      });
      await io.logger.info(`Initial setup completed for ${institution.name}`);
      return {
        accountCount: bankAccounts.length,
        bankConnectionId: bankConnection.id,
        status: "success"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(`Initial setup failed: ${errorMessage}`);
      if (institutionId) {
        const existingConnection = await prisma.bankConnection.findFirst({
          orderBy: {
            createdAt: "desc"
          },
          where: {
            institutionId,
            userId
          }
        });
        if (existingConnection) {
          await prisma.bankConnection.update({
            data: {
              errorMessage,
              status: import_client.BankConnectionStatus.ERROR
            },
            where: { id: existingConnection.id }
          });
        }
      }
      throw error;
    }
  }
});
function mapPlaidAccountType(type, subtype) {
  if (type === "depository") {
    if (subtype === "checking") return import_client.AccountType.DEPOSITORY;
    if (subtype === "savings") return import_client.AccountType.DEPOSITORY;
    return import_client.AccountType.DEPOSITORY;
  }
  if (type === "credit") return import_client.AccountType.CREDIT;
  if (type === "loan") return import_client.AccountType.LOAN;
  if (type === "investment") return import_client.AccountType.INVESTMENT;
  return import_client.AccountType.OTHER;
}
export {
  initialSetupJob
};
//# sourceMappingURL=initial.mjs.map

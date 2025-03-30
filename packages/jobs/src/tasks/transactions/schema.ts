import { z } from 'zod';

/** The number of attachments to process in each batch to manage memory usage */
export const ATTACHMENT_BATCH_SIZE = 20;

/** The number of transactions to fetch in a single database query */
export const TRANSACTION_PAGINATION_SIZE = 50;

/** Maximum file size for attachments (10MB) */
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

/** Warning threshold for large attachments (5MB) */
export const ATTACHMENT_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024;

/**
 * The number of transactions to process in each batch for database operations.
 * Using batch processing improves performance when handling large datasets.
 */
export const IMPORT_BATCH_SIZE = 50;

/**
 * The number of transactions to process in each batch for AI enrichment.
 * Smaller batch size for AI processing reduces memory usage and potential
 * timeouts.
 */
export const ENRICHMENT_BATCH_SIZE = 20;

/**
 * Schema for custom attachment in transaction data
 */
export const transactionCustomAttachmentSchema = z.object({
    id: z.string().describe('Unique identifier for the attachment'),
    name: z.string().nullable().describe('Name of the attachment file'),
    path: z.array(z.string()).describe('Path components for the file in storage'),
    type: z.string().describe('MIME type of the attachment'),
    size: z.number().describe('Size of the attachment in bytes'),
});

/**
 * Schema for bank account data in transaction
 */
export const transactionBankAccountSchema = z.object({
    id: z.string().describe('Unique identifier for the bank account'),
    name: z.string().describe('Name of the bank account'),
});

/**
 * Schema for transaction category data
 */
export const transactionCategorySchema = z.object({
    name: z.string().describe('Name of the transaction category'),
    description: z.string().nullable().describe('Description of the category'),
});

/**
 * Schema for transaction data with included relations
 */
export const transactionWithRelationsSchema = z.object({
    id: z.string().describe('Unique identifier for the transaction'),
    date: z.date().describe('Date of the transaction'),
    name: z.string().describe('Name or description of the transaction'),
    description: z.string().nullable().describe('Additional transaction details'),
    amount: z.number().describe('Transaction amount'),
    currency: z.string().describe('Currency code for the transaction'),
    vatAmount: z.number().nullable().optional().describe('VAT amount if applicable'),
    balance: z.number().nullable().optional().describe('Account balance after transaction'),
    notes: z.string().nullable().optional().describe('User notes about the transaction'),
    transactionCategory: transactionCategorySchema.nullable().describe('Category classification of the transaction'),
    bankAccount: transactionBankAccountSchema.describe('Bank account associated with the transaction'),
    customAttachments: z.array(transactionCustomAttachmentSchema).describe('Custom files attached to the transaction'),
});

/** Type definition for transaction data with included relations - derived from Zod schema */
export type TransactionWithRelations = z.infer<typeof transactionWithRelationsSchema>;

/** Schema for attachment data in the export */
export const attachmentExportDataSchema = z.object({
    id: z.string().describe('ID of the transaction this attachment belongs to'),
    name: z.string().describe('Generated filename for the attachment'),
    blob: z.array(z.number()).nullable().describe('Binary data of the file as a serializable array'),
    originalName: z.string().nullable().describe('Original filename of the attachment'),
    type: z.string().describe('MIME type of the attachment'),
    sizeBytes: z.number().optional().describe('Size of the attachment in bytes'),
    error: z.string().optional().describe('Error message if attachment processing failed'),
});

/** Type for attachment data in the export - derived from Zod schema */
export type AttachmentExportData = z.infer<typeof attachmentExportDataSchema>;

/**
 * Schema for a single row in the export result
 */
export const exportRowSchema = z.tuple([
    z.string().describe('Transaction ID'),
    z.string().describe('Transaction date (YYYY-MM-DD)'),
    z.string().describe('Transaction name'),
    z.string().nullable().describe('Transaction description'),
    z.number().describe('Amount'),
    z.string().describe('Currency code'),
    z.string().describe('Formatted amount with currency symbol'),
    z.string().describe('Formatted VAT amount (if applicable)'),
    z.string().describe('Category name'),
    z.string().describe('Category description'),
    z.string().describe('Has attachments indicator'),
    z.string().describe('Attachment names'),
    z.coerce.string().describe('Balance after transaction'),
    z.string().describe('Bank account name'),
    z.string().nullable().describe('Transaction notes')
]);

/** Type for a properly formatted export row */
export type ExportRow = z.infer<typeof exportRowSchema>;

/**
 * Schema for input parameters to the export processing task
 */
export const processExportInputSchema = z.object({
    /** Array of transaction IDs to include in the export */
    ids: z.array(z.string()).describe('Array of transaction IDs to include in the export'),
    /** Locale string for formatting currency values */
    locale: z.string().describe('Locale string for formatting currency values (e.g., "en-US", "fr-FR")'),
});

/**
 * Statistics schema for export task output
 */
export const exportStatisticsSchema = z.object({
    totalTransactions: z.number().describe('Total number of transactions processed'),
    totalAttachments: z.number().describe('Total number of attachments processed'),
    successfulAttachments: z.number().describe('Number of attachments successfully processed'),
    failedAttachments: z.number().describe('Number of attachments that failed to process'),
    largeAttachments: z.number().describe('Number of attachments above the warning threshold'),
});

/**
 * Schema for output results from the export processing task
 */
export const processExportOutputSchema = z.object({
    rows: z.array(exportRowSchema).describe('Formatted transaction data as rows for export'),
    attachments: z.array(attachmentExportDataSchema).describe('Processed attachment data'),
    stats: exportStatisticsSchema.describe('Export processing statistics'),
});

/**
 * Input parameters for the export processing task derived from the schema
 */
export type ProcessExportInput = z.infer<typeof processExportInputSchema>;

/**
 * Output results from the export processing task derived from the schema
 */
export type ProcessExportOutput = z.infer<typeof processExportOutputSchema>;

/**
 * Schema for transaction data needed for enrichment processing. Defines the
 * shape of transaction objects that will be sent to the enrichment service.
 */
export const transactionForEnrichmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    date: z.union([z.string(), z.instanceof(Date)]),
    amount: z.number(),
    description: z.string().nullable().optional(),
    userId: z.string(),
    bankAccountId: z.string(),
    bankConnectionId: z.string(),
    plaidTransactionId: z.string(),
    pending: z.boolean(),
    category: z.any().nullable(),
    subCategory: z.any().nullable(),
    categoryIconUrl: z.string().nullable(),
    customCategory: z.any().nullable(),
    location: z.any().nullable(),
    paymentChannel: z.any().nullable(),
    paymentMethod: z.any().nullable(),
    merchantName: z.string().nullable(),
    originalDescription: z.string().nullable(),
    originalCategory: z.any().nullable(),
    originalMerchantName: z.string().nullable(),
    excludeFromBudget: z.boolean(),
    isRecurring: z.boolean(),
    recurrenceId: z.string().nullable(),
    tags: z.array(z.string()),
    notes: z.string().nullable(),
    parentTransactionId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isoCurrencyCode: z.string(),
});

/**
 * Type derived from the transaction enrichment schema. Used for type safety
 * when working with transactions to be enriched.
 */
export type TransactionForEnrichment = z.infer<typeof transactionForEnrichmentSchema>;

/**
 * Schema for input parameters to the import and enrich task
 */
export const importAndEnrichInputSchema = z.object({
    /** The type of import source (CSV file or image-extracted data) */
    importType: z.enum(['csv', 'image']).describe('The type of import source (CSV file or image-extracted data)'),
    /** Whether the transaction amounts should be inverted (negative/positive) */
    inverted: z.boolean().describe('Whether the transaction amounts should be inverted (negative/positive)'),
    /** Array of file paths or URLs to the CSV files (required for CSV import) */
    filePath: z.array(z.string()).optional().describe('Array of file paths or URLs to the CSV files (required for CSV import)'),
    /** ID of the bank account to associate with the imported transactions */
    bankAccountId: z.string().describe('ID of the bank account to associate with the imported transactions'),
    /** Currency code for the transaction amounts */
    currency: z.string().describe('Currency code for the transaction amounts'),
    /** ID of the team that owns the transactions */
    teamId: z.string().describe('ID of the team that owns the transactions'),
    /** Table data extracted from an image (required for image import) */
    table: z.array(z.record(z.string())).optional().describe('Table data extracted from an image (required for image import)'),
    /** Column mappings for interpreting CSV or table data */
    mappings: z.record(z.string()).describe('Column mappings for interpreting CSV or table data'),
    /** Whether to perform AI enrichment on the transactions (default: true) */
    shouldEnrich: z.boolean().optional(),
});

/**
 * Schema for output results from the import and enrich task
 */
export const importAndEnrichOutputSchema = z.object({
    /** Whether the import and enrichment process was successful */
    success: z.boolean().describe('Whether the import and enrichment process was successful'),
    /** Number of transactions imported */
    importedCount: z.number().describe('Number of transactions imported'),
    /** Whether the transactions were enriched with AI */
    enriched: z.boolean().describe('Whether the transactions were enriched with AI'),
});

/**
 * Input parameters for the import and enrich task derived from the schema
 */
export type ImportAndEnrichInput = z.infer<typeof importAndEnrichInputSchema>;

/**
 * Output results from the import and enrich task derived from the schema
 */
export type ImportAndEnrichOutput = z.infer<typeof importAndEnrichOutputSchema>;

/**
 * Schema for transaction data needed for enrichment processing. Defines the
 * shape of transaction objects that will be sent to the enrichment service.
 */
export const importedTransactionSchema = z.object({
    internal_id: z.string(),
    id: z.string().optional(),
    name: z.string(),
    description: z.string().nullable().optional(),
    amount: z.union([z.string(), z.number()]),
    date: z.union([z.string(), z.instanceof(Date)]),
    merchant_name: z.string().nullable().optional(),
    bank_account_id: z.string(),
    currency: z.string(),
    category_slug: z.string().nullable().optional(),
    method: z.string().nullable().optional(),
    status: z.string().optional()
});

/**
 * Schema for enriched transaction data returned from the enrichment service.
 */
export const enrichedTransactionSchema = z.object({
    id: z.string(),
    category_slug: z.string().nullable().optional(),
    is_recurring: z.boolean().optional(),
    confidence: z.number().nullable().optional(),
    merchant_category: z.string().nullable().optional(),
    business_purpose: z.string().nullable().optional(),
    need_want_category: z.string().nullable().optional(),
    cash_flow_type: z.string().nullable().optional(),
    tax_deductible: z.boolean().optional().default(false)
});

/**
 * Schema for output results from the sync all transactions job
 */
export const syncAllTransactionsOutputSchema = z.object({
    connectionsProcessed: z.number().describe('Number of connections processed'),
    success: z.boolean().describe('Whether the sync was successful overall')
});

/**
 * Schema for input parameters to the sync user transactions job
 */
export const syncUserTransactionsInputSchema = z.object({
    userId: z.string().describe('ID of the user whose transactions to sync'),
    // TODO: Add optional date range parameters for targeted syncs
    // TODO: Add force sync option to override default sync logic
});

/**
 * Schema for output results from the sync user transactions job
 */
export const syncUserTransactionsOutputSchema = z.object({
    connectionsProcessed: z.number().describe('Number of connections processed'),
    success: z.boolean().describe('Whether the sync was successful overall'),
    userId: z.string().describe('ID of the user whose transactions were synced')
});

/**
 * Schema for results from a single connection sync operation
 */
export const connectionSyncResultSchema = z.object({
    transactions: z.object({
        created: z.number().describe('Number of transactions created'),
        skipped: z.number().describe('Number of transactions skipped'),
        updated: z.number().describe('Number of transactions updated'),
    }),
});

// Type exports
export type ImportedTransaction = z.infer<typeof importedTransactionSchema>;
export type EnrichedTransaction = z.infer<typeof enrichedTransactionSchema>;
export type SyncAllTransactionsOutput = z.infer<typeof syncAllTransactionsOutputSchema>;
export type SyncUserTransactionsInput = z.infer<typeof syncUserTransactionsInputSchema>;
export type SyncUserTransactionsOutput = z.infer<typeof syncUserTransactionsOutputSchema>;
export type ConnectionSyncResult = z.infer<typeof connectionSyncResultSchema>; 
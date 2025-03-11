import { type ClickHouseClient, createClient } from '@clickhouse/client-web'
import { z } from 'zod'
import { Inserter, MutationResponse } from '../mutations/types'

/**
 * Configuration options for the MutationClient
 *
 * @property url - The URL of the ClickHouse server
 */
export type MutationClientConfig = {
    url: string
}

/**
 * Client for ClickHouse mutations
 *
 * This client implements the Inserter interface for mutations and provides methods
 * for inserting data into ClickHouse tables. It handles data validation using Zod schemas
 * and provides a consistent interface for all mutation operations.
 *
 * The client supports both single and batch insert operations, with proper error handling
 * and validation. It's designed to work with the financial data models in the system.
 *
 * @example
 * ```typescript
 * // Create a new mutation client
 * const client = new MutationClient({ url: 'https://clickhouse-server:8443' });
 *
 * // Insert a single transaction
 * const response = await client.insertOne(
 *   'financials.raw_transactions_v1',
 *   transaction,
 *   rawTransactionSchema
 * );
 *
 * // Insert multiple transactions
 * const batchResponse = await client.insertMany(
 *   'financials.raw_transactions_v1',
 *   transactions,
 *   rawTransactionSchema
 * );
 * ```
 */
export class MutationClient implements Inserter {
    /**
     * The underlying ClickHouse client instance
     * @private
     */
    private readonly client: ClickHouseClient

    /**
     * Creates a new MutationClient instance
     *
     * @param config - Configuration options for the client
     */
    constructor(config: MutationClientConfig) {
        this.client = createClient({
            url: config.url,
            clickhouse_settings: {
                output_format_json_quote_64bit_integers: 0,
                output_format_json_quote_64bit_floats: 0,
            },
        })
    }

    /**
     * Insert data into a ClickHouse table
     *
     * This is the core method that handles data insertion. It validates the input data
     * against the provided schema before inserting it into the database. If validation
     * fails, an error is thrown.
     *
     * @param options - Options for the insert operation
     * @param options.table - The name of the table to insert into
     * @param options.values - The values to insert
     * @param options.schema - The Zod schema to validate the values against
     * @returns Promise that resolves when the insert is complete
     * @throws Error if validation fails or if the insert operation fails
     *
     * @example
     * ```typescript
     * await client.insert({
     *   table: 'financials.raw_transactions_v1',
     *   values: transactions,
     *   schema: rawTransactionSchema
     * });
     * ```
     */
    public async insert<T extends z.ZodType>(options: {
        table: string
        values: z.infer<T>[]
        schema: T
    }): Promise<void> {
        try {
            // Validate the data against the schema
            const validationResult = z.array(options.schema).safeParse(options.values)

            if (!validationResult.success) {
                console.error('Validation error:', validationResult.error.message)
                throw new Error(`Validation error: ${validationResult.error.message}`)
            }

            // Insert the data
            await this.client.insert({
                table: options.table,
                format: 'JSONEachRow',
                values: validationResult.data,
            })
        } catch (error) {
            console.error('Error inserting data:', error)
            throw error
        }
    }

    /**
     * Insert a single record into a ClickHouse table
     *
     * This is a convenience method that wraps the insert method for single record insertion.
     * It handles errors and returns a standardized MutationResponse object.
     *
     * @param table - The table to insert into
     * @param value - The value to insert
     * @param schema - The schema to validate against
     * @returns Promise that resolves to a MutationResponse indicating success or failure
     *
     * @example
     * ```typescript
     * const response = await client.insertOne(
     *   'financials.raw_transactions_v1',
     *   {
     *     id: '123',
     *     user_id: 'user-456',
     *     amount: 100.50,
     *     date: '2023-01-15T12:00:00Z',
     *     // ... other transaction fields
     *   },
     *   rawTransactionSchema
     * );
     *
     * if (response.success) {
     *   console.info('Transaction inserted successfully');
     * } else {
     *   console.error('Error inserting transaction:', response.error);
     * }
     * ```
     */
    public async insertOne<T extends z.ZodType>(
        table: string,
        value: z.infer<T>,
        schema: T,
    ): Promise<MutationResponse> {
        try {
            await this.insert({
                table,
                values: [value],
                schema,
            })

            return {
                success: true,
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            return {
                success: false,
                error: errorMessage,
            }
        }
    }

    /**
     * Insert multiple records into a ClickHouse table
     *
     * This is a convenience method that wraps the insert method for batch insertion.
     * It handles errors and returns a standardized MutationResponse object.
     *
     * @param table - The table to insert into
     * @param values - The values to insert
     * @param schema - The schema to validate against
     * @returns Promise that resolves to a MutationResponse indicating success or failure
     *
     * @example
     * ```typescript
     * const transactions = [
     *   {
     *     id: '123',
     *     user_id: 'user-456',
     *     amount: 100.50,
     *     date: '2023-01-15T12:00:00Z',
     *     // ... other transaction fields
     *   },
     *   {
     *     id: '124',
     *     user_id: 'user-456',
     *     amount: 75.25,
     *     date: '2023-01-16T14:30:00Z',
     *     // ... other transaction fields
     *   }
     * ];
     *
     * const response = await client.insertMany(
     *   'financials.raw_transactions_v1',
     *   transactions,
     *   rawTransactionSchema
     * );
     *
     * if (response.success) {
     *   console.info('Transactions inserted successfully');
     * } else {
     *   console.error('Error inserting transactions:', response.error);
     * }
     * ```
     */
    public async insertMany<T extends z.ZodType>(
        table: string,
        values: z.infer<T>[],
        schema: T,
    ): Promise<MutationResponse> {
        try {
            await this.insert({
                table,
                values,
                schema,
            })

            return {
                success: true,
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            return {
                success: false,
                error: errorMessage,
            }
        }
    }
}

/**
 * No-operation implementation of the Inserter interface
 *
 * This class provides a null implementation of the Inserter interface,
 * which can be used when no actual database operations should be performed.
 * It's useful for testing, development, or when the application is running
 * in a mode where database writes are disabled.
 *
 * @example
 * ```typescript
 * // Create a no-op client that doesn't perform any actual database operations
 * const noopClient = new MutationNoop();
 *
 * // This won't actually insert anything, but won't throw errors either
 * await noopClient.insert({
 *   table: 'financials.raw_transactions_v1',
 *   values: transactions,
 *   schema: rawTransactionSchema
 * });
 * ```
 */
export class MutationNoop implements Inserter {
    /**
     * No-operation implementation of the insert method
     *
     * @param _options - Options for the insert operation (ignored)
     * @returns Promise that resolves immediately
     */
    public async insert<T extends z.ZodType>(_options: {
        table: string
        values: z.infer<T>[]
        schema: T
    }): Promise<void> {
        // Do nothing
    }
}

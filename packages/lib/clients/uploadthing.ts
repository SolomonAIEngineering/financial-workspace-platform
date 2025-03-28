import { UTApi, UTFile } from 'uploadthing/server';

import { z } from 'zod';

/**
 * UploadThing API client for server-side file operations.
 *
 * This client provides methods for working with files uploaded via UploadThing,
 * including downloading file content, managing file metadata, and performing
 * other file-related operations.
 */
export const utapi = new UTApi({
    token: process.env.UPLOADTHING_TOKEN,
});

// Zod schemas for parameters
const fileUrlSchema = z.string().url();
const fileKeySchema = z.string();
const fileKeysSchema = z.union([fileKeySchema, z.array(fileKeySchema)]);
const listFilesOptionsSchema = z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    keyType: z.enum(['fileKey', 'customId']).optional(),
}).optional();

const fileStatusSchema = z.enum(['Deletion Pending', 'Failed', 'Uploaded', 'Uploading']);

const fileSchema = z.object({
    name: z.string(),
    size: z.number(),
    customId: z.string().nullable(),
    key: z.string(),
    status: fileStatusSchema,
    id: z.string(),
    uploadedAt: z.number(),
});

const listFilesResponseSchema = z.object({
    files: z.array(fileSchema),
    hasMore: z.boolean(),
});

const renameUpdateSchema = z.object({
    fileKey: z.string(),
    newName: z.string(),
});
const renameUpdatesSchema = z.union([renameUpdateSchema, z.array(renameUpdateSchema)]);

/**
 * Retrieves content from a file stored in UploadThing.
 *
 * @param fileUrl - The URL or key of the file to retrieve
 * @returns A promise that resolves to the file content as a string
 * @throws Error if the file cannot be retrieved
 */
export const getFileContent = async (fileUrl: z.infer<typeof fileUrlSchema>): Promise<string> => {
    try {
        // Validate input
        fileUrlSchema.parse(fileUrl);

        // If it's a direct URL, fetch it directly
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        throw new Error(
            `Failed to get file content: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Deletes one or more files from UploadThing storage.
 * 
 * @param fileKeys - Single file key or array of file keys to delete
 * @returns Promise resolving to deletion result
 */
export const deleteFiles = async (fileKeys: z.infer<typeof fileKeysSchema>) => {
    try {
        // Validate input
        fileKeysSchema.parse(fileKeys);

        const result = await utapi.deleteFiles(fileKeys);
        return result;
    } catch (error) {
        throw new Error(
            `Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Gets URLs for one or more files from UploadThing storage.
 * 
 * @param fileKeys - Single file key or array of file keys
 * @returns Promise resolving to file URL data
 */
export const getFileUrls = async (fileKeys: z.infer<typeof fileKeysSchema>) => {
    try {
        // Validate input
        fileKeysSchema.parse(fileKeys);

        const result = await utapi.getFileUrls(fileKeys);
        return result;
    } catch (error) {
        throw new Error(
            `Failed to get file URLs: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Lists files in UploadThing storage with pagination support.
 * 
 * @param options - Optional parameters for listing files
 * @param options.limit - Maximum number of files to return
 * @param options.offset - Number of files to skip
 * @param options.keyType - Whether to filter by fileKey or customId
 * @returns Promise resolving to file list and pagination info
 */
export const listFiles = async (options?: z.infer<typeof listFilesOptionsSchema>): Promise<z.infer<typeof listFilesResponseSchema>> => {
    try {
        // Validate input
        listFilesOptionsSchema.parse(options);

        const result = await utapi.listFiles(options);

        // Validate response
        return listFilesResponseSchema.parse(result);
    } catch (error) {
        throw new Error(
            `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

/**
 * Renames one or more files in UploadThing storage.
 * 
 * @param updates - Single rename update or array of rename updates
 * @returns Promise resolving to rename operation result
 */
export const renameFiles = async (updates: z.infer<typeof renameUpdatesSchema>) => {
    try {
        // Validate input
        renameUpdatesSchema.parse(updates);

        const result = await utapi.renameFiles(updates);
        return result;
    } catch (error) {
        throw new Error(
            `Failed to rename files: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

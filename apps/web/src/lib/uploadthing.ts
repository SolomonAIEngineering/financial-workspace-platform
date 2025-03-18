import { UTApi } from 'uploadthing/server';

/**
 * UploadThing API client for server-side file operations.
 *
 * This client provides methods for working with files uploaded via UploadThing,
 * including downloading file content, managing file metadata, and performing
 * other file-related operations.
 */
export const utapi = new UTApi();

/**
 * Retrieves content from a file stored in UploadThing.
 *
 * @param fileUrl - The URL or key of the file to retrieve
 * @returns A promise that resolves to the file content as a string
 * @throws Error if the file cannot be retrieved
 */
export const getFileContent = async (fileUrl: string): Promise<string> => {
  try {
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

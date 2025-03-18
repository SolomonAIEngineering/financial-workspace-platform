/**
 * Converts a Blob to a serializable format that can be safely stored and
 * transmitted.
 *
 * This function extracts the binary data from a Blob and converts it to an
 * array of numbers, making it suitable for JSON serialization or database
 * storage.
 *
 * @param blob - The Blob object to convert
 * @returns A Promise resolving to an array of numbers representing the Blob's
 *   binary data
 */
export async function blobToSerializable(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  return Array.from(new Uint8Array(arrayBuffer));
}

/**
 * Converts a serialized array of numbers back to a Blob object.
 *
 * This function reconstructs a Blob from an array of numbers that was
 * previously created using the blobToSerializable function.
 *
 * @param array - The array of numbers representing the Blob's binary data
 * @param contentType - Optional MIME type for the Blob (e.g.,
 *   'application/pdf', 'image/jpeg')
 * @returns A new Blob object with the specified content type
 */
export function serializableToBlob(array: number[], contentType = '') {
  return new Blob([new Uint8Array(array)], { type: contentType });
}

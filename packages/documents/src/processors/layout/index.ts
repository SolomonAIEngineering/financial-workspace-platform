/**
 * @fileoverview Processor for extracting table layout information from documents
 * using Azure Document Intelligence.
 */

import 'server-only'

import {
  getLongRunningPoller,
  isUnexpected,
} from '@azure-rest/ai-document-intelligence'

import type { AnalyzeOperationOutput } from '@azure-rest/ai-document-intelligence'
import { client } from '../../provider/azure'
import type { GetDocumentRequest } from '../../types'

/**
 * Processes documents to extract table layout information.
 *
 * @remarks
 * Uses Azure's prebuilt layout model to analyze document structure and extract tables.
 * The processor organizes table data into a structured format with rows and columns.
 *
 * @example
 * ```typescript
 * const processor = new LayoutProcessor();
 * const tables = await processor.getDocument({ content: base64Content });
 * if (tables) {
 *   tables.forEach(table => {
 *     console.info(`Row ${table.rowIndex}:`, table.cells);
 *   });
 * }
 * ```
 */
export class LayoutProcessor {
  /**
   * Processes a document using Azure's layout analysis model.
   *
   * @param content - Base64 encoded document content
   * @returns Analyzed layout data
   * @throws {Error} If layout analysis fails
   */
  async processDocument(content: string) {
    const initialResponse = await client
      .path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
      .post({
        contentType: 'application/json',
        body: {
          base64Source: content,
        },
      })

    if (isUnexpected(initialResponse)) {
      throw initialResponse.body.error
    }
    const poller = await getLongRunningPoller(client, initialResponse)
    // Cast to any to handle SDK type inconsistencies
    const pollerWithMethods = poller as any
    const result = await pollerWithMethods.pollUntilDone()
    const analyzeResult = result.body as AnalyzeOperationOutput

    return this.extractData(analyzeResult)
  }

  /**
   * Extracts and organizes table data from the analysis result.
   *
   * @param data - Azure analysis result
   * @returns Organized table data by rows and columns, or null if no tables found
   */
  async extractData(data: AnalyzeOperationOutput) {
    const tables = data.analyzeResult?.tables
    const firstTable = tables?.at(0)

    if (!firstTable?.cells?.length) return null

    const cellsByRow = firstTable.cells.reduce(
      (acc, cell) => {
        const rowIndex = cell.rowIndex ?? 0
        if (!acc[rowIndex]) acc[rowIndex] = []
        acc[rowIndex].push({
          columnIndex: cell.columnIndex ?? 0,
          content: cell.content ?? '',
        })
        return acc
      },
      {} as Record<number, { columnIndex: number; content: string }[]>,
    )

    return Object.entries(cellsByRow)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([rowIndex, cells]) => ({
        rowIndex: Number(rowIndex),
        cells: (cells as { columnIndex: number; content: string }[])
          .sort((a, b) => a.columnIndex - b.columnIndex)
          .map((cell) => ({
            columnIndex: cell.columnIndex,
            content: cell.content,
          })),
      }))
  }

  /**
   * Processes a document to extract table layout information.
   *
   * @param params - Document processing parameters
   * @returns Extracted table data
   */
  public async getDocument(params: GetDocumentRequest) {
    return this.processDocument(params.content)
  }
}

import { RouteConfigToTypedResponse, createRoute, z } from '@hono/zod-openapi'

import { openApiErrorResponses as ErrorResponses } from '@/errors'
import { App } from '@/hono/app'
import { Provider } from '@/providers'
import { Routes } from '@/route-definitions/routes'
import { createErrorResponse } from '@/utils/error'
import { env } from 'hono/adapter'
import { StatementPdfParamsSchema } from './schema'

/**
 * OpenAPI route configuration for retrieving a statement PDF.
 */
const route = createRoute({
  tags: [...Routes.Statements.getPdf.tags],
  operationId: Routes.Statements.getPdf.operationId,
  security: [{ bearerAuth: [] }],
  method: Routes.Statements.getPdf.method,
  path: Routes.Statements.getPdf.path,
  summary: Routes.Statements.getPdf.summary,
  request: {
    query: StatementPdfParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/pdf': {
          schema: z.any(),
        },
      },
      description: 'Retrieve statement PDF',
    },
    ...ErrorResponses,
  },
})

export type GetStatementPdfRoute = typeof route
export type GetStatementPdfRequest = z.infer<typeof route.request.query>

/**
 * Registers the Statement PDF API endpoint with the application.
 *
 * @param app - The Hono application instance.
 */
export const registerStatementPdfApi = (app: App) => {
  app.openapi(
    route,
    async (c): Promise<RouteConfigToTypedResponse<typeof route>> => {
      const envs = env(c)
      const { provider, accessToken, statementId, accountId, userId, teamId } =
        c.req.valid('query')

      const api = new Provider({
        provider,
        kv: c.env.KV,
        fetcher: c.env.TELLER_CERT,
        r2: c.env.BANK_STATEMENTS,
        envs,
      })

      try {
        const { pdf, filename } = await api.getStatementPdf({
          accessToken,
          statementId,
          accountId,
          userId,
          teamId,
        })

        // Ensure pdf is a Uint8Array or ArrayBuffer
        const pdfData = new Uint8Array(pdf)

        return c.json(pdfData, 200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        })
      } catch (error) {
        const errorResponse = createErrorResponse(error, c.get('requestId'))
        return c.json(
          {
            error: {
              message: errorResponse.message,
              docs: 'https://engineering-docs.solomon-ai.app/errors',
              requestId: c.get('requestId'),
              code: errorResponse.code,
            },
          },
          400,
        )
      }
    },
  )
}

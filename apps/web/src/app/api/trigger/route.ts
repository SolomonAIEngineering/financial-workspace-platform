import { NextRequest } from 'next/server';
import { client } from "@/jobs/client";

/**
 * This is the API route that Trigger.dev will call to execute jobs
 */
export async function POST(req: NextRequest) {
  const result = await client.handleRequest(req);

  // Convert the result to a proper Response object
  return new Response(result.body, {
    status: result.status,
    headers: result.headers,
  });
}

/**
 * This is needed to disable Next.js body parsing, as Trigger.dev needs the raw body
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Trigger.dev requires GET for health checks
export function GET(_req: NextRequest) {
  // For GET requests, we return a simple health check response
  return Response.json({ status: 'ok' }, { status: 200 });
}

import { type NextRequest, NextResponse } from 'next/server';

import { client } from '@/jobs/client';
import { getServerSession } from '@/server/auth';

/** API endpoint to manually trigger a transaction sync for the current user */
export async function POST(_req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(_req);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const userId = session.user.id;

    // Trigger the sync job for this user
    await client.sendEvent({
      name: 'manual-sync-transactions',
      payload: { userId },
    });

    return NextResponse.json(
      { message: 'Sync started', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error starting sync:', error);

    return NextResponse.json(
      {
        error: 'Failed to start sync',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

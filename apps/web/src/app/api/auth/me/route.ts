import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

/**
 * API route to get the current authenticated user's data
 *
 * This route returns the user's profile data, team information, and bank
 * connections which are needed for the onboarding middleware to determine the
 * user's onboarding status.
 *
 * @returns User data including profile, team, and bank connections
 */
export async function GET(request: Request) {
  console.log('📡 /api/auth/me endpoint called');

  try {
    // Get userId from query parameters or headers
    const url = new URL(request.url);
    const userIdFromQuery = url.searchParams.get('userId');
    const userIdFromHeader = request.headers.get('X-User-ID');
    const userId = userIdFromQuery || userIdFromHeader;

    console.log('🔍 Extracted userId from request:', userId);

    if (!userId) {
      console.log('❌ No userId provided, returning 400');
      return NextResponse.json(
        { error: 'UserId is required' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }

    console.log(
      '🔍 Fetching detailed user data from database for userId:',
      userId
    );
    // Fetch additional user data including team and bank connections
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true,
        firstName: true,
        lastName: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            email: true,
            baseCurrency: true,
          },
        },
        // Include bank connections if they exist
        bankConnections: {
          select: {
            id: true,
            institutionId: true,
            institutionName: true,
            status: true,
          },
        },
      },
    });

    if (!userData) {
      console.log('❌ User data not found in database, returning 404');
      return NextResponse.json(
        { error: 'User not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }

    console.log(
      '✅ User data retrieved successfully:',
      JSON.stringify({
        id: userData.id,
        hasName: !!userData.name,
        hasEmail: !!userData.email,
        hasProfileImage: !!userData.profileImageUrl,
        hasTeamId: !!userData.teamId,
        teamName: userData.team?.name,
        bankConnectionsCount: userData.bankConnections?.length || 0,
      })
    );

    // Check request headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log(
      '📋 Request headers:',
      JSON.stringify({
        cookie: headers.cookie
          ? 'Present (not shown for security)'
          : 'Not present',
        referer: headers.referer,
        'user-agent': headers['user-agent']?.substring(0, 50) + '...',
        'x-user-id': headers['x-user-id'] || 'Not present',
      })
    );

    // Return the data with caching headers
    // private: only cache in browser, not in shared caches
    // max-age: cache for 60 seconds
    // stale-while-revalidate: continue serving stale response while fetching a fresh one
    return NextResponse.json(userData, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('❌ ERROR in /api/auth/me endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}

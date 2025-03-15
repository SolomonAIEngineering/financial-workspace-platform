import { NextResponse } from 'next/server';
import { getOrThrowCurrentUser } from '@/lib/auth';
import { prisma } from '@/server/db';

/**
 * API route to get the current authenticated user's data
 * 
 * This route returns the user's profile data, team information, and bank connections
 * which are needed for the onboarding middleware to determine the user's onboarding status.
 * 
 * @returns User data including profile, team, and bank connections
 */
export async function GET(request: Request) {
    console.log('📡 /api/auth/me endpoint called');

    try {
        console.log('🔑 Attempting to get authenticated user');
        // Get the current authenticated user
        const user = await getOrThrowCurrentUser();

        console.log('👤 Auth user retrieved:', user ? `ID: ${user.id}` : 'No user found');

        if (!user) {
            console.log('❌ No authenticated user found, returning 401');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔍 Fetching detailed user data from database');
        // Fetch additional user data including team and bank connections
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('✅ User data retrieved successfully:', JSON.stringify({
            id: userData.id,
            hasName: !!userData.name,
            hasEmail: !!userData.email,
            hasProfileImage: !!userData.profileImageUrl,
            hasTeamId: !!userData.teamId,
            teamName: userData.team?.name,
            bankConnectionsCount: userData.bankConnections?.length || 0
        }));

        // Check request headers for debugging
        const headers = Object.fromEntries(request.headers.entries());
        console.log('📋 Request headers:', JSON.stringify({
            cookie: headers.cookie ? 'Present (not shown for security)' : 'Not present',
            referer: headers.referer,
            'user-agent': headers['user-agent']?.substring(0, 50) + '...',
        }));

        return NextResponse.json(userData);
    } catch (error) {
        console.error('❌ ERROR in /api/auth/me endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
} 
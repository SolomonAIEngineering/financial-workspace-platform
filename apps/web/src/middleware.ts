import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routes } from './lib/navigation/routes';

// Define paths that should bypass onboarding checks
const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/api/',
    '/_next/',
    '/favicon.ico',
];

// Define auth callback paths that should bypass all middleware checks
const AUTH_CALLBACK_PATHS = [
    '/api/auth/google/callback',
    '/api/auth/github/callback',
    '/api/auth/google/login',
    '/api/auth/github/login',
];

export async function middleware(request: NextRequest) {
    console.log('🔍 MIDDLEWARE STARTED:', request.nextUrl.pathname);
    console.log('🌐 Full URL:', request.url);

    const sessionId = request.cookies.get("session")?.value;
    const userId = request.cookies.get("user_id")?.value;

    // Skip middleware for auth callback paths - these need special handling
    const { pathname } = request.nextUrl;
    console.log('📍 Current pathname:', pathname);

    // First check for auth callback paths - these should bypass ALL middleware
    if (AUTH_CALLBACK_PATHS.some((path) => pathname.includes(path))) {
        console.log('🔐 Auth callback detected, bypassing all middleware:', pathname);
        return NextResponse.next();
    }

    // Check if path is exactly the root path
    if (pathname === '/') {
        console.log('⏭️ Skipping middleware for root path');
        return NextResponse.next();
    }

    // Then check for other public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        console.log('⏭️ Skipping middleware for public path:', pathname);
        return NextResponse.next();
    }

    console.log('🔒 Path is protected, checking authentication:', pathname);

    // If no session or user_id, allow the auth system to handle redirection
    if (!sessionId || !userId) {
        console.log('❌ No session cookie or user_id found, proceeding to next middleware');
        return NextResponse.next();
    } else {
        console.log('🔑 Session cookie found, user_id:', userId);
    }

    // Check if user has skipped bank connection
    const hasBankSkipped =
        request.cookies.get('onboarding-bank-skipped')?.value === 'true';
    console.log('💰 Bank connection skipped:', hasBankSkipped);

    // Fetch user data from API
    try {
        console.log('🔄 Fetching user data from API with userId:', userId);
        const apiUrl = `${request.nextUrl.origin}/api/auth/me?userId=${userId}`;
        console.log('📡 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                cookie: request.headers.get("cookie") || "",
                "X-User-ID": userId || "",
            },
        });
        console.log('📊 API response status:', response.status);

        if (!response.ok) {
            console.log('❌ API call failed with status:', response.status);
            return NextResponse.next();
        }

        const user = await response.json();
        console.log('👤 User data received:', JSON.stringify({
            id: user.id,
            hasName: !!user.name,
            hasEmail: !!user.email,
            hasProfileImage: !!user.profileImageUrl,
            hasTeamId: !!user.teamId,
            bankConnectionsCount: user.bankConnections?.length || 0
        }));

        // Check if user has a team
        const hasTeam = Boolean(user.teamId);
        console.log('👥 User has team:', hasTeam);

        if (!hasTeam && !pathname.startsWith(routes.onboardingTeam())) {
            console.log('🔄 Redirecting to team creation:', routes.onboardingTeam());
            return NextResponse.redirect(new URL(routes.onboardingTeam(), request.url));
        }

        // If user has a team but is in team creation step, move to next step
        if (hasTeam && pathname === routes.onboardingTeam()) {
            console.log('🔄 Team exists, redirecting to profile step:', routes.onboardingProfile());
            return NextResponse.redirect(new URL(routes.onboardingProfile(), request.url));
        }

        // Check if user has completed profile
        const hasProfile = Boolean(
            user.name && user.email && user.profileImageUrl
        );
        console.log('👤 User has completed profile:', hasProfile);

        if (hasTeam && !hasProfile && !pathname.startsWith(routes.onboardingProfile())) {
            console.log('🔄 Redirecting to profile completion:', routes.onboardingProfile());
            return NextResponse.redirect(
                new URL(routes.onboardingProfile(), request.url)
            );
        }

        // If user has profile but is in profile step, move to next step
        if (hasTeam && hasProfile && pathname === '/onboarding/profile') {
            console.log('🔄 Profile complete, redirecting to bank connection:', '/onboarding/bank-connection');
            return NextResponse.redirect(
                new URL('/onboarding/bank-connection', request.url)
            );
        }

        // Check if user has connected a bank account
        const hasBankConnection =
            user.bankConnections && user.bankConnections.length > 0;
        console.log('🏦 User has bank connection:', hasBankConnection);

        if (
            hasTeam &&
            hasProfile &&
            !hasBankConnection &&
            !hasBankSkipped &&
            !pathname.startsWith('/onboarding/bank-connection')
        ) {
            console.log('🔄 Redirecting to bank connection:', '/onboarding/bank-connection');
            return NextResponse.redirect(
                new URL('/onboarding/bank-connection', request.url)
            );
        }

        // If all steps are complete and user is still in onboarding, redirect to dashboard
        if (
            hasTeam &&
            hasProfile &&
            (hasBankConnection || hasBankSkipped) &&
            pathname.startsWith('/onboarding')
        ) {
            console.log('🔄 Onboarding complete, redirecting to dashboard:', '/dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        console.log('✅ All middleware checks passed, proceeding to requested page');
    } catch (error) {
        console.error('❌ ERROR in onboarding middleware:', error);
        // If there's an error, proceed to next middleware
        return NextResponse.next();
    }

    // Allow the request to proceed
    console.log('✅ Middleware complete, proceeding to next middleware');
    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}; 
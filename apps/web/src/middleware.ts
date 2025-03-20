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
  console.info('🔍 MIDDLEWARE STARTED:', request.nextUrl.pathname);
  console.info('🌐 Full URL:', request.url);

  const sessionId = request.cookies.get('session')?.value;
  const userId = request.cookies.get('user_id')?.value;

  // Skip middleware for auth callback paths - these need special handling
  const { pathname } = request.nextUrl;
  console.info('📍 Current pathname:', pathname);

  // First check for auth callback paths - these should bypass ALL middleware
  if (AUTH_CALLBACK_PATHS.some((path) => pathname.includes(path))) {
    console.info(
      '🔐 Auth callback detected, bypassing all middleware:',
      pathname
    );
    return NextResponse.next();
  }

  // Check if path is exactly the root path
  if (pathname === '/') {
    console.info('⏭️ Skipping middleware for root path');
    return NextResponse.next();
  }

  // Then check for other public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.info('⏭️ Skipping middleware for public path:', pathname);
    return NextResponse.next();
  }

  console.info('🔒 Path is protected, checking authentication:', pathname);

  // If no session or user_id, allow the auth system to handle redirection
  if (!sessionId || !userId) {
    console.info(
      '❌ No session cookie or user_id found, proceeding to next middleware'
    );
    return NextResponse.next();
  } else {
    console.info('🔑 Session cookie found, user_id:', userId);
  }

  // Check if user has skipped bank connection
  const hasBankSkipped =
    request.cookies.get('onboarding-bank-skipped')?.value === 'true';
  console.info('💰 Bank connection skipped:', hasBankSkipped);

  // Fetch user data from API
  try {
    console.info('🔄 Fetching user data from API with userId:', userId);
    const apiUrl = `${request.nextUrl.origin}/api/auth/me?userId=${userId}`;
    console.info('📡 API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        cookie: request.headers.get('cookie') || '',
        'X-User-ID': userId || '',
      },
    });
    console.info('📊 API response status:', response.status);

    if (!response.ok) {
      console.info('❌ API call failed with status:', response.status);
      return NextResponse.next();
    }

    const user = await response.json();
    console.info(
      '👤 User data received:',
      JSON.stringify({
        id: user.id,
        hasName: !!user.name,
        hasEmail: !!user.email,
        hasProfileImage: !!user.profileImageUrl,
        hasTeamId: !!user.teamId,
        bankConnectionsCount: user.bankConnections?.length || 0,
      })
    );

    // Check if user has a team
    const hasTeam = Boolean(user.teamId);
    console.info('👥 User has team:', hasTeam);

    if (!hasTeam && !pathname.startsWith(routes.onboardingTeam())) {
      console.info('🔄 Redirecting to team creation:', routes.onboardingTeam());
      return NextResponse.redirect(
        new URL(routes.onboardingTeam(), request.url)
      );
    }

    // If user has a team but is in team creation step, move to next step
    if (hasTeam && pathname === routes.onboardingTeam()) {
      console.info(
        '🔄 Team exists, redirecting to profile step:',
        routes.onboardingProfile()
      );
      return NextResponse.redirect(
        new URL(routes.onboardingProfile(), request.url)
      );
    }

    // Check if user has completed profile - simplified version
    // Only check for name, email, profileImageUrl and username
    const hasProfile = Boolean(
      user.name &&
      user.name.trim() !== '' &&
      user.email &&
      user.email.trim() !== '' &&
      user.profileImageUrl &&
      user.profileImageUrl.trim() !== '' &&
      user.username &&
      user.username.trim() !== ''
    );

    if (
      hasTeam &&
      !hasProfile &&
      !pathname.startsWith(routes.onboardingProfile())
    ) {
      console.info(
        '🔄 Redirecting to profile completion:',
        routes.onboardingProfile()
      );
      return NextResponse.redirect(
        new URL(routes.onboardingProfile(), request.url)
      );
    }

    // If user has profile but is in profile step, move to next step
    if (hasTeam && hasProfile && pathname === '/onboarding/profile') {
      console.info(
        '🔄 Profile complete, redirecting to bank connection:',
        '/onboarding/bank-connection'
      );
      return NextResponse.redirect(
        new URL('/onboarding/bank-connection', request.url)
      );
    }

    // Check if user has connected a bank account
    const hasBankConnection =
      user.bankConnections && user.bankConnections.length > 0;
    console.info('🏦 User has bank connection:', hasBankConnection);

    if (
      hasTeam &&
      hasProfile &&
      !hasBankConnection &&
      !hasBankSkipped &&
      !pathname.startsWith('/onboarding/bank-connection')
    ) {
      console.info(
        '🔄 Redirecting to bank connection:',
        '/onboarding/bank-connection'
      );
      return NextResponse.redirect(
        new URL('/onboarding/bank-connection', request.url)
      );
    }

    // If all steps are complete and user is still in onboarding, redirect to dashboard
    if (
      hasTeam &&
      hasProfile &&
      (hasBankConnection || hasBankSkipped) &&
      pathname.startsWith('/onboarding/complese')
    ) {
      console.info(
        '🔄 Onboarding complete, redirecting to dashboard:',
        '/dashboard'
      );
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.info(
      '✅ All middleware checks passed, proceeding to requested page'
    );
  } catch (error) {
    console.error('❌ ERROR in onboarding middleware:', error);
    // If there's an error, proceed to next middleware
    return NextResponse.next();
  }

  // Allow the request to proceed
  console.info('✅ Middleware complete, proceeding to next middleware');
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

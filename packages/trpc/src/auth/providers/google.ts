import type { AuthProviderConfig } from '../lucia';
import { Google } from 'arctic';
import { findOrCreateUser } from '@solomonai/lib/server-only/user';

const googleAuth = new Google(
  process.env.GOOGLE_CLIENT_ID ?? '',
  process.env.GOOGLE_CLIENT_SECRET ?? '',
  process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/google/callback'
);

const config: AuthProviderConfig = {
  name: 'google',
  pkce: true, // Enable PKCE
};

const getProviderAuthorizationUrl = (state: string, codeVerifier: string) => {
  return googleAuth.createAuthorizationURL(state, codeVerifier, [
    'email',
    'profile',
    'openid',
  ]);
};

interface GoogleUser {
  email: string;
  email_verified: boolean;
  name: string;
  sub: string;
  family_name?: string;
  given_name?: string;
  picture?: string;
}

const handleProviderCallback = async (
  code: string,
  codeVerifier: string,
  userId?: string
) => {
  try {
    const tokens = await googleAuth.validateAuthorizationCode(
      code,
      codeVerifier
    );

    let accessToken;

    try {
      accessToken = tokens.accessToken();

      if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Invalid access token format');
      }
    } catch (tokenError) {
      console.error('Token extraction error:', tokenError);
      console.error('Tokens object:', JSON.stringify(tokens, null, 2));

      throw new Error('Failed to extract access token');
    }

    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: new Headers({
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        }),
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', {
        body: errorText,
        status: response.status,
        statusText: response.statusText,
      });

      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const googleUser = (await response.json()) as GoogleUser;

    if (!googleUser.email_verified) {
      throw new Error('Email not verified with Google');
    }

    const user = await findOrCreateUser({
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      name: googleUser.name,
      profileImageUrl: googleUser.picture,
      providerId: 'google',
      providerUserId: googleUser.sub,
      username: googleUser.email.split('@')[0],
    });

    return user.id;
  } catch (error) {
    console.error('Google auth error:', error);

    throw error;
  }
};

export const googleProvider = {
  config,
  getProviderAuthorizationUrl,
  handleProviderCallback,
};

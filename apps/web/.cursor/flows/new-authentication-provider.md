# Implementing Google Authentication

Follow these steps in order to add Google OAuth support:

1. Set Up Google OAuth Credentials

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Google OAuth2 API
   - Configure OAuth consent screen
   - Create OAuth 2.0 Client credentials
   - Add authorized redirect URI: `{NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`
   - Save Client ID and Client Secret

2. Add Environment Variables

   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

   - Add these to your `.env` file
   - Update environment configuration in deployment

3. Create Google Provider

   - Location: `src/server/auth/providers/google.ts`
   - Use `arctic` package for OAuth implementation
   - Reference: `src/server/auth/providers/github.ts`
   - Implement required methods:
     - `getProviderAuthorizationUrl`
     - `handleProviderCallback`
   - Configure scopes for email, profile, etc.

4. Update Auth Provider Configuration

   - File: `src/server/auth/lucia.ts`
   - Import the Google provider
   - Add to `authProviders` object
   - Update `AuthProviders` type

5. Update Route Types

   - File: `src/lib/navigation/routes.ts`
   - Add Google to provider params type
   - Example:

   ```ts
   loginProvider: {
     params: {
       provider: 'github' | 'google'
     }
     // ... rest of the type
   }
   ```

6. Test Implementation

   - Start the development server
   - Test login flow:
     1. Click login with Google
     2. Authorize application
     3. Verify redirect and session creation
     4. Check user creation in database
   - Test account linking (when logged in)
   - Test error cases and edge scenarios

Remember:

- Use PKCE (Proof Key for Code Exchange) for enhanced security
- Handle email verification status from Google
- Properly handle user data merging for existing emails
- Follow OAuth 2.0 best practices
- Test both development and production environments
- Ensure proper error handling and user feedback
- Consider rate limiting for OAuth endpoints
- Keep credentials secure and never commit them to version control

Example Google Provider Implementation:

```typescript
import { Google } from 'arctic'
import type { AuthProviderConfig } from '../lucia'
import { findOrCreateUser } from '../findOrCreateUser'
import { env } from '@/env'

const googleAuth = new Google(
  env.GOOGLE_CLIENT_ID ?? '',
  env.GOOGLE_CLIENT_SECRET ?? '',
  env.NEXT_PUBLIC_SITE_URL + '/api/auth/google/callback',
)

const config: AuthProviderConfig = {
  name: 'google',
  pkce: true, // Enable PKCE
}

const getProviderAuthorizationUrl = (state: string, codeVerifier: string) => {
  return googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ['email', 'profile'],
  })
}

const handleProviderCallback = async (
  code: string,
  codeVerifier: string,
  userId?: string,
) => {
  const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier)

  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  )

  const googleUser = await response.json()

  const user = await findOrCreateUser({
    email: googleUser.email,
    firstName: googleUser.given_name,
    lastName: googleUser.family_name,
    name: googleUser.name,
    profileImageUrl: googleUser.picture,
    providerId: 'google',
    providerUserId: googleUser.sub,
    username: googleUser.email.split('@')[0],
  })

  return user.id
}

export const googleProvider = {
  config,
  getProviderAuthorizationUrl,
  handleProviderCallback,
}
```

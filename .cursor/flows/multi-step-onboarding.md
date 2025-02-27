# Implementing Multi-Step Onboarding

Follow these steps to implement a multi-step onboarding process:

1. Update Database Schema

   ```prisma
   // schema.prisma
   model User {
     // ... existing fields ...
     onboardingStatus    OnboardingStatus     @default(PENDING)
     onboardingSteps     OnboardingStep[]
     // Add additional profile fields as needed
   }

   model OnboardingStep {
     id          String      @id @default(cuid())
     userId      String
     user        User        @relation(fields: [userId], references: [id])
     step        String      // e.g., "PROFILE", "PREFERENCES", "WORKSPACE"
     status      StepStatus  @default(INCOMPLETE)
     data        Json?       // Store step-specific data
     completedAt DateTime?
     createdAt   DateTime    @default(now())
     updatedAt   DateTime    @updatedAt
   }

   enum OnboardingStatus {
     PENDING
     IN_PROGRESS
     COMPLETED
     SKIPPED
   }

   enum StepStatus {
     INCOMPLETE
     COMPLETED
     SKIPPED
   }
   ```

2. Create Backend API Routes

   - Location: `src/server/hono/routes/onboarding.ts`
   - Implement the following endpoints:
     - GET `/api/onboarding/status` - Get current onboarding status
     - POST `/api/onboarding/step/:step` - Submit step data
     - GET `/api/onboarding/step/:step` - Get step data
     - POST `/api/onboarding/complete` - Mark onboarding as complete
     - POST `/api/onboarding/skip` - Skip onboarding

3. Update Authentication Flow

   - Modify `findOrCreateUser` in `src/server/auth/findOrCreateUser.ts`:

   ```typescript
   export const findOrCreateUser = async (
     {
       // ... existing params ...
     }
   ) => {
     const user = await prisma.user.create({
       data: {
         // ... existing fields ...
         onboardingStatus: 'PENDING',
         onboardingSteps: {
           create: [
             { step: 'PROFILE' },
             { step: 'PREFERENCES' },
             { step: 'WORKSPACE' },
           ],
         },
       },
     });

     return user;
   };
   ```

4. Create Frontend Components

   - Create new directory: `src/components/onboarding/`
   - Implement the following components:
     ```typescript
     // OnboardingLayout.tsx - Wrapper for all onboarding steps
     // StepProgress.tsx - Progress indicator
     // ProfileStep.tsx - User profile information
     // PreferencesStep.tsx - User preferences
     // WorkspaceStep.tsx - Workspace setup
     // Navigation.tsx - Step navigation controls
     ```

5. Add State Management

   ```typescript
   // src/components/onboarding/store.ts
   export const useOnboardingStore = create<OnboardingStore>((set) => ({
     currentStep: 'PROFILE',
     stepData: {},
     status: 'PENDING',
     setStep: (step) => set({ currentStep: step }),
     updateStepData: (step, data) =>
       set((state) => ({
         stepData: { ...state.stepData, [step]: data },
       })),
     // ... other actions
   }));
   ```

6. Update Route Protection

   ```typescript
   // src/components/auth/useAuthGuard.ts
   export const useAuthGuard = () => {
     const user = useAuthUser();
     const router = useRouter();

     return useCallback(
       (callback?: () => Promise<void> | void) => {
         if (!user?.id) {
           pushModal('Login');
           return true;
         }

         if (user.onboardingStatus === 'PENDING') {
           router.push('/onboarding');
           return true;
         }

         return callback ? void callback() : false;
       },
       [user?.id, user?.onboardingStatus]
     );
   };
   ```

7. Create Onboarding Routes

   ```typescript
   // src/app/(dynamic)/(auth)/onboarding/page.tsx
   export default function OnboardingPage() {
     const { currentStep } = useOnboardingStore();

     return (
       <OnboardingLayout>
         <StepProgress />
         {currentStep === 'PROFILE' && <ProfileStep />}
         {currentStep === 'PREFERENCES' && <PreferencesStep />}
         {currentStep === 'WORKSPACE' && <WorkspaceStep />}
         <Navigation />
       </OnboardingLayout>
     );
   }
   ```

8. Implement Analytics

   ```typescript
   // src/lib/analytics/onboarding.ts
   export const trackOnboardingProgress = (
     step: string,
     status: StepStatus
   ) => {
     analytics.track('onboarding_step', {
       step,
       status,
       timestamp: new Date().toISOString(),
     });
   };
   ```

9. Add Error Handling

   ```typescript
   // src/components/onboarding/error-boundary.tsx
   export class OnboardingErrorBoundary extends React.Component {
     // Implement error boundary for onboarding steps
     // Include retry mechanism
     // Provide user feedback
     // Log errors for monitoring
   }
   ```

10. Define API Types and Validation

    ```typescript
    // src/lib/validation/onboarding.ts
    import { z } from 'zod';

    export const ProfileSchema = z.object({
      displayName: z.string().min(2).max(50),
      bio: z.string().max(160).optional(),
      avatarUrl: z.string().url().optional(),
      timezone: z.string(),
    });

    export const PreferencesSchema = z.object({
      theme: z.enum(['light', 'dark', 'system']),
      emailNotifications: z.boolean(),
      // ... other preferences
    });

    export const WorkspaceSchema = z.object({
      name: z.string().min(3).max(50),
      // ... other workspace settings
    });

    export type ProfileData = z.infer<typeof ProfileSchema>;
    export type PreferencesData = z.infer<typeof PreferencesSchema>;
    export type WorkspaceData = z.infer<typeof WorkspaceSchema>;
    ```

11. Implement Middleware

    ```typescript
    // src/server/middleware/onboarding.ts
    import { Context, Next } from 'hono';
    import { OnboardingStatus } from '@prisma/client';

    const ONBOARDING_ROUTES = ['/onboarding', '/api/onboarding'];

    export const onboardingMiddleware = async (c: Context, next: Next) => {
      const user = c.get('user');
      const path = c.req.path;

      // Allow authentication routes
      if (path.startsWith('/api/auth')) {
        return next();
      }

      // Check if user needs onboarding
      if (
        user?.onboardingStatus !== OnboardingStatus.COMPLETED &&
        !ONBOARDING_ROUTES.some((route) => path.startsWith(route))
      ) {
        return c.redirect('/onboarding');
      }

      return next();
    };
    ```

12. Session Management

    ```typescript
    // src/lib/onboarding/session.ts
    export const ONBOARDING_SESSION_KEY = 'onboarding_session';

    export interface OnboardingSession {
      lastStep: string;
      stepData: Record<string, unknown>;
      lastActive: number;
    }

    export const saveOnboardingProgress = async (
      userId: string,
      step: string,
      data: unknown
    ) => {
      await redis.hset(`${ONBOARDING_SESSION_KEY}:${userId}`, {
        lastStep: step,
        [`stepData:${step}`]: JSON.stringify(data),
        lastActive: Date.now(),
      });
    };

    export const resumeOnboardingProgress = async (
      userId: string
    ): Promise<OnboardingSession | null> => {
      const session = await redis.hgetall(
        `${ONBOARDING_SESSION_KEY}:${userId}`
      );

      if (!session) return null;

      return {
        lastStep: session.lastStep,
        stepData: JSON.parse(session[`stepData:${session.lastStep}`] || '{}'),
        lastActive: parseInt(session.lastActive, 10),
      };
    };
    ```

13. Database Migrations

    ```sql
    -- migrations/YYYYMMDDHHMMSS_add_onboarding.sql
    -- Up Migration
    ALTER TABLE "User" ADD COLUMN "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';

    CREATE TABLE "OnboardingStep" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "step" TEXT NOT NULL,
      "status" "StepStatus" NOT NULL DEFAULT 'INCOMPLETE',
      "data" JSONB,
      "completedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "OnboardingStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );

    CREATE INDEX "OnboardingStep_userId_idx" ON "OnboardingStep"("userId");

    -- Down Migration
    DROP TABLE "OnboardingStep";
    ALTER TABLE "User" DROP COLUMN "onboardingStatus";
    ```

14. Testing Strategy

    ```typescript
    // src/components/onboarding/__tests__/ProfileStep.test.tsx
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
    import { ProfileStep } from '../ProfileStep';

    describe('ProfileStep', () => {
      it('validates required fields', async () => {
        render(<ProfileStep />);

        fireEvent.click(screen.getByText('Continue'));

        await waitFor(() => {
          expect(screen.getByText('Display name is required')).toBeInTheDocument();
        });
      });

      it('submits valid data successfully', async () => {
        const mockSubmit = jest.fn();
        render(<ProfileStep onSubmit={mockSubmit} />);

        fireEvent.change(screen.getByLabelText('Display Name'), {
          target: { value: 'Test User' }
        });

        fireEvent.click(screen.getByText('Continue'));

        await waitFor(() => {
          expect(mockSubmit).toHaveBeenCalledWith({
            displayName: 'Test User'
          });
        });
      });
    });

    // src/e2e/onboarding.spec.ts
    describe('Onboarding Flow', () => {
      it('completes full onboarding process', async () => {
        // Start with fresh user
        await page.goto('/signup');
        // ... complete signup

        // Should redirect to onboarding
        expect(page.url()).toContain('/onboarding');

        // Complete profile step
        await page.fill('[name="displayName"]', 'Test User');
        await page.click('text=Continue');

        // Complete preferences step
        await page.click('[data-theme="dark"]');
        await page.click('text=Continue');

        // Complete workspace step
        await page.fill('[name="workspaceName"]', 'My Workspace');
        await page.click('text=Complete');

        // Should redirect to main app
        expect(page.url()).toBe('/');
      });
    });
    ```

Remember:

- Implement proper form validation for each step
- Add loading states and progress indicators
- Save progress automatically
- Provide clear navigation between steps
- Allow users to return to previous steps
- Consider mobile responsiveness
- Add helpful tooltips and guidance
- Implement proper error handling
- Track analytics for completion rates
- Consider A/B testing different flows
- Add ability to skip non-essential steps
- Ensure proper data validation
- Consider accessibility requirements
- Add proper loading states
- Implement proper error recovery
- Consider offline support
- Add proper documentation
- Implement proper session timeout handling
- Add progress auto-save functionality
- Consider rate limiting for API endpoints
- Implement proper database indexing
- Add monitoring for completion rates
- Consider implementing A/B testing framework
- Add proper logging for debugging
- Consider implementing feature flags
- Add proper security headers
- Implement proper CSRF protection
- Consider implementing webhook notifications
- Add proper backup/restore functionality
- Consider implementing progress export/import
- Add proper monitoring alerts
- Consider implementing user feedback collection

Example Step Component:

```typescript
import { useState } from 'react';
import { useOnboardingStore } from './store';

export function ProfileStep() {
  const [loading, setLoading] = useState(false);
  const { updateStepData, nextStep } = useOnboardingStore();

  const handleSubmit = async (data: ProfileData) => {
    try {
      setLoading(true);
      await fetch('/api/onboarding/step/profile', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      updateStepData('PROFILE', data);
      nextStep();
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-step">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
```

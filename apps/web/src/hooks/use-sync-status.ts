import { useEffect, useState } from 'react';

import { SyncStatus } from '@/types/status';
import { useRealtimeRun } from '@trigger.dev/react-hooks';

/** Props for the useSyncStatus hook. */
type UseSyncStatusProps = {
  /** The ID of the synchronization run to track. */
  runId?: string;
  /**
   * The access token required for authentication with the synchronization
   * service.
   */
  accessToken?: string;
};

/**
 * UseSyncStatus Hook
 *
 * This hook manages the state and lifecycle of a synchronization operation,
 * providing real-time status updates and state management.
 *
 * @remarks
 *   The hook integrates with trigger.dev's real-time run tracking to monitor
 *   synchronization jobs. It automatically handles state transitions based on
 *   the synchronization's progress and completion status.
 *
 *   The hook maintains the current status of the synchronization (syncing,
 *   completed, failed) and provides a way to manually update this status if
 *   needed.
 * @example
 *   ```tsx
 *   const { status, setStatus } = useSyncStatus({
 *     runId: 'sync-123',
 *     accessToken: 'user-token'
 *   });
 *
 *   if (status === SyncStatus.SYNCING) {
 *     return <LoadingSpinner />;
 *   } else if (status === SyncStatus.COMPLETED) {
 *     return <SuccessMessage />;
 *   } else if (status === SyncStatus.FAILED) {
 *     return <ErrorMessage />;
 *   }
 *   ```;
 *
 * @param props - Configuration options for the synchronization tracking
 * @param props.runId - Initial run ID for the synchronization operation
 * @param props.accessToken - Authentication token for accessing the
 *   synchronization service
 * @returns An object containing:
 *
 *   - Status: Current status of the synchronization (SYNCING, COMPLETED, FAILED, or
 *       null)
 *   - SetStatus: Function to manually update the synchronization status
 */
export function useSyncStatus({
  runId: initialRunId,
  accessToken: initialAccessToken,
}: UseSyncStatusProps) {
  const [accessToken, setAccessToken] = useState<string | undefined>(
    initialAccessToken
  );
  const [runId, setRunId] = useState<string | undefined>(initialRunId);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const { run, error } = useRealtimeRun(runId, {
    enabled: !!runId && !!accessToken,
    accessToken,
  });

  useEffect(() => {
    if (initialRunId && initialAccessToken) {
      setAccessToken(initialAccessToken);
      setRunId(initialRunId);
      setStatus(SyncStatus.SYNCING);
    }
  }, [initialRunId, initialAccessToken]);

  useEffect(() => {
    if (error || run?.status === 'FAILED') {
      setStatus(SyncStatus.FAILED);
    }

    if (run?.status === 'COMPLETED') {
      setStatus(SyncStatus.COMPLETED);
    }
  }, [error, run]);

  return {
    status,
    setStatus,
  };
}

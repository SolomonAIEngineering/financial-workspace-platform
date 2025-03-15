import { useEffect, useState } from 'react';

import type { AnyTask } from '@trigger.dev/sdk/v3';
import { useRealtimeRunWithStreams } from '@trigger.dev/react-hooks';

/**
 * Represents the progress of a synchronization operation.
 */
export type SyncProgress = {
  /**
   * The current progress value (e.g., number of items processed).
   */
  current: number;
  /**
   * The total number of items to process.
   */
  total: number;
  /**
   * A descriptive message about the current sync state.
   */
  message: string;
  /**
   * The current status of the synchronization.
   * - 'idle': Not started or waiting to begin
   * - 'syncing': Currently in progress
   * - 'success': Successfully completed
   * - 'error': Failed with an error
   */
  status?: 'idle' | 'syncing' | 'success' | 'error';
};

/**
 * Represents a stream of data from a sync operation.
 */
export type SyncStream = {
  /**
   * Unique identifier for the stream.
   */
  id: string;
  /**
   * The content/payload of the stream.
   */
  data: string;
  /**
   * ISO timestamp when the stream was created.
   */
  createdAt: string;
  /**
   * The ID of the run that generated this stream.
   */
  runId: string;
};

/**
 * The result object returned by the useSyncProgress hook.
 */
export type UseSyncProgressResult = {
  /**
   * Current progress information of the sync operation.
   */
  progress: SyncProgress;
  /**
   * Array of data streams from the sync operation.
   */
  streams: SyncStream[];
  /**
   * Current status of the sync operation.
   */
  status: 'idle' | 'syncing' | 'success' | 'error';
  /**
   * Error object if the sync operation failed, null otherwise.
   */
  error: Error | null;
  /**
   * Indicates whether the hook is still loading initial data.
   */
  isLoading: boolean;
};

/**
 * UseSyncProgress Hook
 * 
 * This hook tracks the progress and status of a synchronization operation running
 * on Trigger.dev, providing real-time updates, stream data, and error handling.
 * 
 * @remarks
 * The hook integrates with Trigger.dev's real-time run tracking to monitor sync jobs.
 * It automatically handles state transitions based on the run's status and progress metadata.
 * 
 * The hook maintains several pieces of state:
 * - Current progress (current/total items and descriptive message)
 * - Stream data from the sync operation
 * - Overall status (idle, syncing, success, error)
 * - Error information if the operation fails
 * - Loading state while initial data is being fetched
 * 
 * @param runId - The ID of the Trigger.dev run to track
 * @param accessToken - Optional access token for authentication with Trigger.dev
 * 
 * @returns An object containing:
 * - progress: Current progress information (current/total/message)
 * - streams: Array of data streams from the sync operation
 * - status: Current status of the sync (idle/syncing/success/error)
 * - error: Error object if the sync failed, null otherwise
 * - isLoading: Boolean indicating if initial data is still loading
 * 
 * @example
 * ```tsx
 * const { progress, status, error, isLoading } = useSyncProgress(
 *   'run-123abc',
 *   'auth-token-xyz'
 * );
 * 
 * if (isLoading) {
 *   return <LoadingSpinner />;
 * }
 * 
 * if (status === 'error') {
 *   return <ErrorMessage error={error} />;
 * }
 * 
 * return (
 *   <div>
 *     <ProgressBar 
 *       value={progress.current} 
 *       max={progress.total} 
 *     />
 *     <p>{progress.message}</p>
 *     {status === 'success' && <SuccessMessage />}
 *   </div>
 * );
 * ```
 */
export function useSyncProgress(
  runId?: string,
  accessToken?: string
): UseSyncProgressResult {
  const [status, setStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Use the Trigger.dev hook to get real-time updates with streams
  const { run, streams, error } = useRealtimeRunWithStreams(runId || '', {
    accessToken,
    enabled: !!runId,
  });

  // Default progress state
  const defaultProgress: SyncProgress = {
    current: 0,
    total: 100,
    message: 'Waiting to start...',
    status: 'idle',
  };

  // Extract progress from run metadata
  const progress: SyncProgress = run?.metadata?.progress
    ? typeof run.metadata.progress === 'object'
      ? (run.metadata.progress as SyncProgress)
      : defaultProgress
    : defaultProgress;

  // Update loading state when run data changes
  useEffect(() => {
    if (run) {
      setIsLoading(false);
    }
  }, [run]);

  // Update status based on run state and progress
  useEffect(() => {
    if (!run) {
      setStatus('idle');
      return;
    }

    if (error) {
      setStatus('error');
      return;
    }

    if (run.status === 'COMPLETED') {
      setStatus('success');
      return;
    }

    if (
      run.status === 'FAILED' ||
      run.status === 'CRASHED' ||
      run.status === 'SYSTEM_FAILURE' ||
      run.status === 'TIMED_OUT'
    ) {
      setStatus('error');
      return;
    }

    if (
      progress &&
      typeof progress === 'object' &&
      progress.status === 'error'
    ) {
      setStatus('error');
      return;
    }

    if (
      run.status === 'EXECUTING' ||
      run.status === 'QUEUED' ||
      run.status === 'WAITING_FOR_DEPLOY' ||
      run.status === 'REATTEMPTING'
    ) {
      setStatus('syncing');
      return;
    }

    // If progress is 100%, consider it success
    if (
      progress &&
      typeof progress === 'object' &&
      progress.current === progress.total &&
      progress.total > 0
    ) {
      setStatus('success');
      return;
    }

    setStatus('syncing');
  }, [run, error, progress]);

  // Convert streams to our expected format
  const formattedStreams: SyncStream[] = Array.isArray(streams)
    ? streams.map((stream) => ({
      id: typeof stream.id === 'string' ? stream.id : '',
      data: typeof stream.data === 'string' ? stream.data : '',
      createdAt: stream.createdAt
        ? new Date(stream.createdAt).toISOString()
        : new Date().toISOString(),
      runId: typeof stream.runId === 'string' ? stream.runId : run?.id || '',
    }))
    : [];

  return {
    progress,
    streams: formattedStreams,
    status,
    error: error || null,
    isLoading,
  };
}

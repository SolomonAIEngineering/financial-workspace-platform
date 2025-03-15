import { useEffect, useState } from 'react';

import { ExportStatus } from '@/types/status';
import { useRealtimeRun } from '@trigger.dev/react-hooks';

/**
 * Props for the useExportStatus hook.
 */
type UseExportStatusProps = {
  /**
   * The ID of the export run to track.
   */
  runId?: string;
  /**
   * The access token required for authentication with the export service.
   */
  accessToken?: string;
};

/**
 * UseExportStatus Hook
 * 
 * This hook manages the state and lifecycle of an export operation, providing real-time
 * status updates, progress tracking, and result handling.
 * 
 * @remarks
 * The hook integrates with trigger.dev's real-time run tracking to monitor export jobs.
 * It automatically handles state transitions based on the export's progress and completion status.
 * 
 * The hook maintains several pieces of state:
 * - Current status of the export (in progress, completed, failed)
 * - Progress percentage of the export operation
 * - Result data once the export is complete
 * 
 * @param props - Configuration options for the export tracking
 * @param props.runId - Initial run ID for the export operation
 * @param props.accessToken - Authentication token for accessing the export service
 * 
 * @returns An object containing:
 * - status: Current status of the export (IN_PROGRESS, COMPLETED, FAILED, or null)
 * - setStatus: Function to manually update the export status
 * - progress: Numerical progress value between 0-100
 * - result: The export result data (available when completed)
 * 
 * @example
 * ```tsx
 * const { status, progress, result } = useExportStatus({
 *   runId: 'export-123',
 *   accessToken: 'user-token'
 * });
 * 
 * if (status === ExportStatus.IN_PROGRESS) {
 *   return <ProgressBar value={progress} />;
 * } else if (status === ExportStatus.COMPLETED) {
 *   return <ExportResult data={result} />;
 * } else if (status === ExportStatus.FAILED) {
 *   return <ErrorMessage />;
 * }
 * ```
 */
export function useExportStatus({
  runId: initialRunId,
  accessToken: initialAccessToken,
}: UseExportStatusProps = {}) {
  const [accessToken, setAccessToken] = useState<string | undefined>(
    initialAccessToken
  );
  const [runId, setRunId] = useState<string | undefined>(initialRunId);
  const [status, setStatus] = useState<ExportStatus | null>(null);

  const [_, setProgress] = useState<number>(0);

  const [result, setResult] = useState<any>(null);

  const { run, error } = useRealtimeRun(runId, {
    enabled: !!runId && !!accessToken,
    accessToken,
  });

  useEffect(() => {
    if (initialRunId && initialAccessToken) {
      setAccessToken(initialAccessToken);
      setRunId(initialRunId);
      setStatus(ExportStatus.IN_PROGRESS);
    }
  }, [initialRunId, initialAccessToken]);

  useEffect(() => {
    if (error || run?.status === 'FAILED') {
      setStatus(ExportStatus.FAILED);
      setProgress(0);
    }

    if (run?.status === 'COMPLETED') {
      setStatus(ExportStatus.COMPLETED);
      setProgress(100);
    }
  }, [error, run]);

  useEffect(() => {
    if (run?.output) {
      setResult(run.output);
    }
  }, [run]);

  return {
    status,
    setStatus,
    progress: run?.metadata?.progress ?? 0,
    result,
  };
}

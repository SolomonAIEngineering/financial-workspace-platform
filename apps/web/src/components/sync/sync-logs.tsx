'use client';

import { ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

import { SyncStream } from '@/hooks/use-sync-progress';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

type SyncLogsProps = {
  streams: SyncStream[];
  maxHeight?: string;
  showToggle?: boolean;
};

/** Component to display detailed sync logs from Trigger.dev streams */
export function SyncLogs({
  streams,
  maxHeight = '200px',
  showToggle = true,
}: SyncLogsProps) {
  const [expanded, setExpanded] = useState(false);

  // Filter out empty streams
  const validStreams = streams.filter((stream) => stream && stream.data);

  // If no streams, don't render anything
  if (validStreams.length === 0) {
    return null;
  }

  // Format the timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  // Group streams by type (error vs regular)
  const errorStreams = validStreams.filter((stream) =>
    stream.data.toLowerCase().includes('error')
  );

  const regularStreams = validStreams.filter(
    (stream) => !stream.data.toLowerCase().includes('error')
  );

  // Sort streams by timestamp (newest first)
  const sortedStreams = [...errorStreams, ...regularStreams].sort((a, b) => {
    try {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } catch (e) {
      return 0;
    }
  });

  return (
    <div className="w-full rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      {showToggle && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between p-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center gap-1.5">
            <Info size={14} />
            <span>Sync Details</span>
            <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
              {validStreams.length}
            </span>
            {errorStreams.length > 0 && (
              <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {errorStreams.length}{' '}
                {errorStreams.length === 1 ? 'error' : 'errors'}
              </span>
            )}
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      <div
        className={`overflow-auto px-3 py-2 text-xs ${
          showToggle && !expanded ? 'hidden' : ''
        }`}
        style={{ maxHeight }}
      >
        {sortedStreams.map((stream, index) => (
          <div
            key={stream.id || index}
            className={`mb-1.5 flex items-start gap-2 ${
              stream.data.toLowerCase().includes('error')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Clock size={12} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span>{stream.data}</span>
              {stream.createdAt && (
                <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
                  {formatTime(stream.createdAt)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

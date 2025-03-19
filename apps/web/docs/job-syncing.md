# Transaction Sync with Trigger.dev Realtime

This directory contains components for displaying real-time transaction sync progress using Trigger.dev's Realtime API.

## Overview

When a user connects their bank account through Plaid, we trigger a background job to sync their transactions. Using Trigger.dev's Realtime API, we can provide real-time updates to the user about the progress of this sync process.

## Components

### SyncLogs

The `SyncLogs` component displays detailed logs from the sync process. It shows:

- Progress messages
- Error messages (highlighted in red)
- Timestamps for each log entry
- A collapsible interface to save space

## How It Works

1. **Backend**: The sync job emits progress updates and stream data using:

   - `io.setMetadata()` for progress tracking
   - `io.stream()` for detailed log messages

2. **Frontend**: We use Trigger.dev's React hooks to subscribe to these updates:

   - `useRealtimeRunWithStreams` to get real-time updates on the run status and streams

3. **UI**: The `SyncStatusContent` component in the connect-transactions-modal displays:
   - A progress bar based on the current/total progress
   - Detailed logs using the `SyncLogs` component
   - Different states (syncing, success, error) with appropriate UI

## Customization

You can customize the appearance of the logs by modifying the `SyncLogs` component:

- `maxHeight`: Controls the maximum height of the logs container
- `showToggle`: Whether to show the expand/collapse toggle

## References

- [Trigger.dev Realtime API Documentation](https://trigger.dev/docs/realtime/overview)
- [Trigger.dev React Hooks](https://trigger.dev/docs/realtime/react-hooks)

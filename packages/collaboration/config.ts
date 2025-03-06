// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      // Example, real-time cursor coordinates
      cursor: { x: number; y: number } | null
    }

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    Storage: {
      // Example, a conflict-free list
      // animals: LiveList<string>;
    }

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string
      info: {
        name?: string
        avatar?: string
        color: string
      }
    }

    // Custom events, for useBroadcastEvent, useEventListener
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    RoomEvent: {
      // Example has two events, using a union
      // | { type: "PLAY" }
      // | { type: "REACTION"; emoji: "🔥" };
    }

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    }

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    }
  }
}

export {}

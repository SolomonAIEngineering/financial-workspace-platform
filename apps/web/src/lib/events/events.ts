/** Events definition for application-wide logging and tracking */

export const LogEvents = {
  SendFeedback: {
    channel: 'feedback',
    name: 'feedback.send',
  },
  // Add other events here
} as const;

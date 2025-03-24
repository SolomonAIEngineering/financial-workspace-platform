/** Events definition for application-wide logging and tracking */

export const LogEvents = {
  SendFeedback: {
    channel: 'feedback',
    name: 'feedback.send',
  },
  ConnectBankCompleted: {
    channel: 'bank',
    name: 'bank.connect.completed',
  },
  // Add other events here
} as const;

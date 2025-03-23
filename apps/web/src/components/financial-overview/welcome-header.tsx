import React from 'react';

/** Props for the WelcomeHeader component */
interface WelcomeHeaderProps {
  /** The name of the user to display in the welcome message */
  userName: string;
}

/**
 * Renders a welcome header with the user's name
 *
 * @param userName - The name of the user to display
 */
export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName }) => (
  <div className="animate-fade-in">
    <h1 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
      Welcome, {userName || 'User'}
    </h1>
    <p className="max-w-2xl text-gray-600">
      Track your finances, manage your accounts, and make transfers all in one
      place.
    </p>
  </div>
);

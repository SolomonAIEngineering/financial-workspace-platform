import { BankAccountCardData } from './types';
import React from 'react';

/** Props for the BankAccountVisual component */
interface BankAccountVisualProps {
  /** The bank account data to visualize */
  account: BankAccountCardData;
}

/**
 * Renders a visual representation of a bank account
 *
 * @param account - The bank account data to visualize
 */
export const BankAccountVisual: React.FC<BankAccountVisualProps> = ({
  account,
}) => {
  // Use black color scheme for all account types
  return (
    <div className="relative aspect-7/4 transform overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02]">
      {/* Black background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1.5" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Account content */}
      <div className="relative flex h-full flex-col justify-between p-6">
        {/* Account institution and status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9.5V14.5C2 17.5 4 19.5 7 19.5H17C20 19.5 22 17.5 22 14.5V9.5C22 6.5 20 4.5 17 4.5H7C4 4.5 2 6.5 2 9.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 9.5V14.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 9.5V14.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="ml-2 text-sm font-medium text-white">
              Bank Account
            </span>
          </div>

          <div className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {account.status === 'Active' ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        {/* Account type badge */}
        <div className="my-6 self-start rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {account.type}
        </div>

        {/* Account number */}
        <div className="mb-4 flex justify-between text-lg font-bold tracking-widest text-white drop-shadow-md">
          <span>****</span>
          <span>****</span>
          <span>****</span>
          <span>{account.number}</span>
        </div>

        {/* Account footer */}
        <div className="z-10 flex items-end justify-between">
          {/* Account holder */}
          <div className="flex flex-col">
            <span className="text-xs text-white/60 uppercase">
              Account Holder
            </span>
            <span className="text-sm font-medium text-white">
              {account.name}
            </span>
          </div>

          {/* Available balance */}
          <div className="flex flex-col text-right">
            <span className="text-xs text-white/60 uppercase">
              Available Balance
            </span>
            <span className="text-sm font-medium text-white">
              {account.available}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

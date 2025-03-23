import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { BankAccountItemProps } from './types';
import Link from 'next/link';
import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';

// Card variants using class-variance-authority for better type safety
const cardVariants = cva(
  'rounded-xl border p-4 transition-all duration-300 relative overflow-hidden group',
  {
    variants: {
      selected: {
        true: 'border-primary/80 shadow-xl dark:border-primary/70 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15',
        false:
          'border-gray-200 shadow-sm hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800/90 hover:dark:border-gray-600 dark:hover:bg-gray-800',
      },
      accountType: {
        CHECKING:
          'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900',
        CREDIT:
          'bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-gray-900',
      },
    },
    defaultVariants: {
      selected: false,
      accountType: 'CHECKING',
    },
  }
);

// Status badge variants
const statusVariants = cva(
  'inline-flex text-xs font-medium rounded-full px-2.5 py-1 text-center transition-all duration-300',
  {
    variants: {
      status: {
        Active:
          'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400',
        Inactive:
          'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400',
        Pending:
          'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400',
        Locked:
          'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400',
      },
    },
    defaultVariants: {
      status: 'Active',
    },
  }
);

/**
 * Renders a bank account item that can be selected
 *
 * @param account - The bank account data to display
 * @param isSelected - Whether this account is currently selected
 * @param onSelect - Callback function when the account is selected
 */
export const BankAccountItem: React.FC<BankAccountItemProps> = ({
  account,
  isSelected,
  onSelect,
}) => {
  const { id, type, number, name, limit, status } = account;

  // Determine if this is a checking or credit account type
  const accountType = type.includes('CHECKING') ? 'CHECKING' : 'CREDIT';

  // Generate a unique gradient ID for this card
  const gradientId = `card-gradient-${number}`;

  // Card animations
  const cardAnimations = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    whileHover: { y: -2, transition: { duration: 0.2 } },
    whileTap: { y: 0, scale: 0.98, transition: { duration: 0.1 } },
  };

  // Checkmark animation variants
  const checkmarkVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 30 },
    },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
  };

  // Glow effect variants
  const glowVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 0.7, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="relative mb-3 w-full"
      {...cardAnimations}
      data-testid="bank-account-item"
    >
      <input
        type="radio"
        id={`account-${id}`}
        name="radio-buttons"
        className="peer sr-only"
        checked={isSelected}
        onChange={() => onSelect(account)}
        aria-label={`Select ${type} account ending in ${number}`}
      />

      <label
        htmlFor={`account-${id}`}
        className={`${cardVariants({ selected: isSelected, accountType })} block`}
      >
        {/* Card background effects */}
        <div className="bg-grid-pattern absolute inset-0 opacity-30 mix-blend-overlay dark:opacity-10 dark:mix-blend-color-dodge"></div>

        {/* Animated gradient background for selected state */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/15 dark:to-primary/10"
            variants={glowVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:to-primary/10"></div>

        <div className="relative z-10 grid grid-cols-12 items-center gap-4">
          {/* Account Icon & Number with Selected Indicator */}
          <div className="col-span-12 flex items-center space-x-3 sm:col-span-3">
            {/* Selected marker */}
            {isSelected && (
              <motion.div
                className="absolute -top-1 -left-1 z-30 flex items-center justify-center rounded-full bg-primary shadow-md"
                variants={checkmarkVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CheckCircle2 className="h-5 w-5 text-white drop-shadow-lg" />
              </motion.div>
            )}

            <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-md shadow-sm">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 32 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                    id={gradientId}
                  >
                    {accountType === 'CHECKING' ? (
                      <>
                        <stop stopColor="#4B5563" offset="0%" />
                        <stop stopColor="#1F2937" offset="100%" />
                      </>
                    ) : (
                      <>
                        <stop stopColor="#4634B1" offset="0%" />
                        <stop stopColor="#9FA1FF" offset="100%" />
                      </>
                    )}
                  </linearGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <rect
                    fill={`url(#${gradientId})`}
                    width="32"
                    height="24"
                    rx="4"
                  />
                  <ellipse fill="#E61C24" cx="12.5" cy="12" rx="5.5" ry="5.6" />
                  <ellipse fill="#F99F1B" cx="19.5" cy="12" rx="5.5" ry="5.6" />
                  <path
                    d="M16 7.6A5.7 5.7 0 0 0 13.9 12c0 1.7.8 3.3 2.1 4.4A5.7 5.7 0 0 0 18.1 12a5.7 5.7 0 0 0-2.1-4.4Z"
                    fill="#F26622"
                  />
                </g>
              </svg>

              {/* Card chip effect */}
              <div className="absolute top-1 left-1 h-2 w-3 rounded-sm bg-yellow-300/80"></div>
            </div>

            <div>
              <div
                className={`text-sm font-medium transition-colors duration-300 ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-white'}`}
              >
                {type}
              </div>
              <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                •••• {number}
              </div>
            </div>
          </div>

          {/* Account Name */}
          <div className="col-span-12 sm:col-span-4 lg:col-span-4">
            <div
              className={`truncate text-sm font-medium transition-colors duration-300 ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-white'} dark:group-hover:text-primary-400 group-hover:text-primary`}
            >
              {name}
            </div>
          </div>

          {/* Account Limit */}
          <div className="col-span-6 sm:col-span-2 lg:col-span-3">
            <div className="text-sm font-medium dark:text-gray-300">
              {limit}
            </div>
          </div>

          {/* Account Status */}
          <div className="col-span-4 text-right sm:col-span-2 lg:col-span-1">
            <div className={statusVariants({ status: status as any })}>
              {status}
            </div>
          </div>

          {/* View Details Button */}
          <div className="col-span-2 text-right sm:col-span-1 lg:col-span-1">
            <Link
              href={`/financial-overview/${id}`}
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-300 ${
                isSelected
                  ? 'hover:bg-primary-600 transform bg-primary text-white hover:scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              } `}
              title={`View details for ${type} account ending in ${number}`}
              aria-label={`View details for ${type} account ending in ${number}`}
            >
              <span className="sr-only sm:not-sr-only sm:mr-1">View</span>
              <ArrowRight
                className={`h-3.5 w-3.5 transition-transform duration-300 ${isSelected ? 'group-hover:translate-x-0.5' : ''}`}
              />
            </Link>
          </div>
        </div>
      </label>

      {/* Selection border indicator with animation */}
      <motion.div
        className={`pointer-events-none absolute inset-0 z-10 rounded-xl border-2 border-transparent ${isSelected ? 'border-primary-500 dark:border-primary-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}`}
        aria-hidden="true"
        initial={{ borderColor: 'rgba(0,0,0,0)' }}
        animate={{
          borderColor: isSelected
            ? 'var(--color-primary-500)'
            : 'rgba(0,0,0,0)',
          boxShadow: isSelected
            ? '0 0 15px rgba(59,130,246,0.3)'
            : '0 0 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

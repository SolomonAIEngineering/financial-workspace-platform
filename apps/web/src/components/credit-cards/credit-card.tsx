import { Card } from '../ui/card';
import { HTMLAttributes } from 'react';

/**
 * CreditCardProps
 *
 * @param title - The title of the credit card
 * @param amount - The amount of the credit card
 * @param description - The description of the credit card
 * @param cardHolderName - The name of the card holder
 * @param last4Digits - The last 4 digits of the card number
 * @param balance - The balance of the credit card
 */
interface CreditCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  amount: number;
  description: string;
  cardHolderName: string;
  last4Digits: string;
  expirationDate: string;
  balance: number;
}

/**
 * CreditCard
 *
 * @param title - The title of the credit card
 * @param amount - The amount of the credit card
 * @param description - The description of the credit card
 */
export default function CreditCard({
  title,
  amount,
  description,
  cardHolderName,
  last4Digits,
  balance,
  ...props
}: CreditCardProps) {
  return (
    <Card {...props}>
      <div className="relative aspect-7/4 overflow-hidden rounded-xl bg-linear-to-tr from-gray-900 to-gray-800 p-5">
        <div className="relative flex h-full flex-col justify-between">
          {/* Logo on card */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <defs>
              <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="icon1-b">
                <stop stopColor="#E5E7EB" offset="0%" />
                <stop stopColor="#9CA3AF" offset="100%" />
              </linearGradient>
              <linearGradient
                x1="50%"
                y1="24.537%"
                x2="50%"
                y2="99.142%"
                id="icon1-c"
              >
                <stop stopColor="#374151" offset="0%" />
                <stop stopColor="#374151" stopOpacity="0" offset="100%" />
              </linearGradient>
              <path id="icon1-a" d="M16 0l16 32-16-5-16 5z" />
            </defs>
            <g transform="rotate(90 16 16)" fill="none" fillRule="evenodd">
              <mask id="icon1-d" fill="#fff">
                <use xlinkHref="#icon1-a" />
              </mask>
              <use fill="url(#icon1-b)" xlinkHref="#icon1-a" />
              <path
                fill="url(#icon1-c)"
                mask="url(#icon1-d)"
                d="M16-6h20v38H16z"
              />
            </g>
          </svg>
          {/* Card number */}
          <div className="flex justify-between text-lg font-bold tracking-widest text-gray-200 drop-shadow-md">
            <span>****</span>
            <span>****</span>
            <span>****</span>
            <span>{last4Digits}</span>
          </div>
          {/* Card footer */}
          <div className="relative z-10 mb-0.5 flex items-center justify-between">
            {/* Card expiration */}
            <div className="space-x-3 text-sm font-bold tracking-widest text-gray-200 drop-shadow-md">
              <span>CVC ***</span>
            </div>
          </div>
          {/* Mastercard logo */}
          <svg
            className="absolute right-0 bottom-0"
            width="48"
            height={28}
            viewBox="0 0 48 28"
          >
            <circle fill="#F0BB33" cx="34" cy="14" r="14" fillOpacity=".8" />
            <circle fill="#FF5656" cx="14" cy="14" r="14" fillOpacity=".8" />
          </svg>
        </div>
      </div>
    </Card>
  );
}

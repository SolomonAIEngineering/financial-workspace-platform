import { Button } from '@/registry/default/potion-ui/button';
import { MoreHorizontal } from 'lucide-react';

/**
 * Props interface for the WalletCard component
 *
 * @property {string} userName - Name of the card holder to display on the card
 * @property {string} cardNumber - Last 4 digits of the card number (or masked
 *   number)
 * @interface WalletCardProps
 */
interface WalletCardProps {
  userName: string;
  cardNumber: string;
  name?: string;
}

/**
 * WalletCard component displays a stylized credit/debit card visualization with
 * user information and masked card number
 *
 * @param {WalletCardProps} props - Component props
 * @returns {JSX.Element} Visual representation of a payment card with stacked
 *   shadow effect
 * @component
 */
export function WalletCard({ userName, cardNumber, name = 'VISA' }: WalletCardProps) {
  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">
          My Account
        </h2>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative">
        <div>
          {/* Black Card */}
          <div className="relative z-10 h-64 w-[26rem] rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8 text-white shadow-2xl ring-1 ring-gray-700/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Top Row: Card Type and Chip */}
            <div className="mb-12 flex items-center justify-between">
              <span className="text-xl font-bold tracking-widest uppercase text-white/90">
                {name}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-8 rounded-sm bg-gradient-to-tr from-yellow-300 to-yellow-100 shadow-inner" />
                <div className="h-6 w-6 rounded-full bg-white shadow-inner ring-1 ring-gray-500 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-gray-700" />
                </div>
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="mb-4">
              <p className="text-sm font-medium tracking-wide text-gray-300">{userName}</p>
            </div>

            {/* Card Number and Expiry */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <p className="tracking-[0.3em] text-lg font-semibold text-white/80">
                **** **** **** {cardNumber}
              </p>
              <p className="text-sm font-semibold text-white/60">12/25</p>
            </div>

            {/* Branding Mark */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="h-5 w-8 rounded-sm bg-gradient-to-br from-gray-400/50 to-gray-300/10 shadow-inner ring-1 ring-white/20" />
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30">
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/30">
                  <div className="h-2 w-2 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Shadow Cards */}
        <div className="absolute top-0 left-0 z-0 h-64 w-[26rem] -translate-y-3 translate-x-1/4 transform rounded-2xl bg-gray-300 opacity-70 dark:bg-gray-700"></div>
        <div className="absolute top-0 left-0 z-0 h-64 w-[26rem] -translate-y-6 translate-x-2/4 transform rounded-2xl bg-gray-200 opacity-40 dark:bg-gray-600"></div>
      </div>
    </div>
  );
}

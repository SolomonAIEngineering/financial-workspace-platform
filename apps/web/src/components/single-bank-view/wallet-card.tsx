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
export function WalletCard({ userName, cardNumber }: WalletCardProps) {
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
        {/* Black Card */}
        <div className="relative z-10 h-44 w-72 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-lg">
          <div className="mb-10 flex justify-between">
            <span className="text-xl font-semibold tracking-widest uppercase">
              VISA
            </span>
          </div>

          <div className="mb-4">
            <p className="text-gray-300">{userName}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="tracking-widest text-gray-300">
              **** **** **** {cardNumber}
            </p>
            <p className="text-gray-300">12/25</p>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-3">
            <div className="h-6 w-8 rounded border border-gray-600 bg-gray-400/30"></div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-600">
              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-600">
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Shadow Cards */}
        <div className="absolute top-0 left-0 z-0 h-44 w-72 translate-x-1/3 -translate-y-2 transform rounded-2xl bg-gray-300 opacity-70 dark:bg-gray-700"></div>
        <div className="absolute top-0 left-0 z-0 h-44 w-72 translate-x-2/3 -translate-y-4 transform rounded-2xl bg-gray-200 opacity-40 dark:bg-gray-600"></div>
      </div>
    </div>
  );
}

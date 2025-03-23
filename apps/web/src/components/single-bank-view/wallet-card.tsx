import { Button } from '@/registry/default/potion-ui/button';
import { MoreHorizontal } from 'lucide-react';

/**
 * Props interface for the WalletCard component
 * 
 * @interface WalletCardProps
 * @property {string} userName - Name of the card holder to display on the card
 * @property {string} cardNumber - Last 4 digits of the card number (or masked number)
 */
interface WalletCardProps {
    userName: string;
    cardNumber: string;
}

/**
 * WalletCard component displays a stylized credit/debit card visualization
 * with user information and masked card number
 * 
 * @component
 * @param {WalletCardProps} props - Component props
 * @returns {JSX.Element} Visual representation of a payment card with stacked shadow effect
 */
export function WalletCard({ userName, cardNumber }: WalletCardProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">My Wallet</h2>
                <Button variant="ghost" size="icon" className="text-gray-500">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>

            <div className="relative">
                {/* Black Card */}
                <div className="relative z-10 w-72 h-44 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow-lg">
                    <div className="flex justify-between mb-10">
                        <span className="text-xl uppercase font-semibold tracking-widest">VISA</span>
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-300">{userName}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-gray-300 tracking-widest">**** **** **** {cardNumber}</p>
                        <p className="text-gray-300">12/25</p>
                    </div>

                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="w-8 h-6 bg-gray-400/30 rounded border border-gray-600"></div>
                        <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shadow Cards */}
                <div className="absolute top-0 left-0 w-72 h-44 rounded-2xl bg-gray-300 dark:bg-gray-700 transform translate-x-1/3 -translate-y-2 z-0 opacity-70"></div>
                <div className="absolute top-0 left-0 w-72 h-44 rounded-2xl bg-gray-200 dark:bg-gray-600 transform translate-x-2/3 -translate-y-4 z-0 opacity-40"></div>
            </div>
        </div>
    );
} 
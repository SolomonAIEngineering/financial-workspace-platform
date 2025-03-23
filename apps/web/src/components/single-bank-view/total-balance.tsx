import { Button } from '@/registry/default/potion-ui/button';
import { ChevronDown } from 'lucide-react';

interface TotalBalanceProps {
    formattedBalance: string;
}

export function TotalBalance({ formattedBalance }: TotalBalanceProps) {
    return (
        <div className="mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-300">Total Balance</p>
            <div className="flex items-end justify-between mt-2">
                <h2 className="text-5xl font-semibold text-indigo-950 dark:text-white">
                    {formattedBalance}
                </h2>
                <div className="flex items-center mb-2 gap-4">
                    <Button
                        variant="outline"
                        className="rounded-lg border border-gray-200 flex items-center gap-2 bg-white text-gray-800"
                    >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full overflow-hidden bg-blue-50">
                            <span className="font-bold text-xs">$</span>
                        </span>
                        USD
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button className="rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200">
                        Withdraw
                    </Button>
                </div>
            </div>
        </div>
    );
} 
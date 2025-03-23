import { Transaction } from './types';

interface TopCategoriesProps {
    transactions: Transaction[];
    isLoading: boolean;
}

export function TopCategories({ transactions, isLoading }: TopCategoriesProps) {
    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-indigo-950 dark:text-white mb-4">Top Spending Categories</h3>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    (() => {
                        // Calculate top categories
                        const categories: Record<string, number> = {};
                        transactions
                            .filter(tx => tx.amount < 0)
                            .forEach(tx => {
                                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
                            });

                        // Sort and get top 4
                        const topCategories = Object.entries(categories)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4);

                        const total = topCategories.reduce((sum, [_, amount]) => sum + amount, 0);

                        return (
                            <div className="space-y-3">
                                {topCategories.map(([category, amount], index) => {
                                    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                                    const colors = [
                                        'bg-indigo-500 dark:bg-indigo-400',
                                        'bg-blue-500 dark:bg-blue-400',
                                        'bg-teal-500 dark:bg-teal-400',
                                        'bg-emerald-500 dark:bg-emerald-400',
                                    ];

                                    return (
                                        <div key={category} className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{category}</span>
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {amount.toLocaleString('en-US', {
                                                            style: 'currency',
                                                            currency: 'USD'
                                                        })}
                                                    </span>
                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
} 
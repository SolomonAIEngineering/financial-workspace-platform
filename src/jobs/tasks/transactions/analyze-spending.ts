import { cronTrigger } from '@trigger.dev/sdk';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

import { prisma } from '@/server/db';

import { client } from '../../client';

/**
 * This job analyzes users' spending patterns and identifies trends, calculating
 * monthly statistics and generating insights.
 */
export const analyzeSpendingJob = client.defineJob({
  id: 'analyze-spending-patterns-job',
  name: 'Analyze Spending Patterns',
  trigger: cronTrigger({
    cron: '0 2 * * *', // Every day at 2 AM
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await io.logger.info('Starting spending pattern analysis');

    // Get active users with transactions
    const activeUsers = await io.runTask('get-active-users', async () => {
      return await prisma.user.findMany({
        select: {
          id: true,
        },
        take: 100, // Process in batches
        where: {
          transactions: {
            some: {
              date: {
                gte: subMonths(new Date(), 3), // Active in last 3 months
              },
            },
          },
        },
      });
    });

    await io.logger.info(`Found ${activeUsers.length} active users to analyze`);

    // Process each user
    // for (const user of activeUsers) {
    //   await io.runTask(`analyze-user-${user.id}`, async () => {
    //     try {
    //       // Get last 3 months
    //       const today = new Date();
    //       const threeMonthsAgo = subMonths(today, 3);

    //       // Monthly spending analysis
    //       const monthlyStats = await generateMonthlyStats(
    //         user.id,
    //         threeMonthsAgo,
    //         today
    //       );

    //       // Category spending analysis
    //       const categoryStats = await generateCategoryStats(
    //         user.id,
    //         threeMonthsAgo,
    //         today
    //       );

    //       // Identify top merchants
    //       const topMerchants = await getTopMerchants(
    //         user.id,
    //         threeMonthsAgo,
    //         today
    //       );

    //       // Calculate average transaction size
    //       const avgTransactionSize = await getAverageTransactionSize(
    //         user.id,
    //         threeMonthsAgo,
    //         today
    //       );

    //       // Store insights for the user
    //       await prisma.spendingInsight.create({
    //         data: {
    //           userId: user.id,
    //           startDate: threeMonthsAgo,
    //           endDate: today,
    //           timeframe: 'MONTH',
    //           year: today.getFullYear(),
    //           month: today.getMonth() + 1,
    //           totalTransactions: avgTransactionSize.count,
    //           totalSpending: monthlyStats.reduce((sum, month) => sum + month.spending, 0),
    //           avgTransactionSize: avgTransactionSize.avgAmount,
    //           categoryStats: categoryStats,
    //           merchantStats: { topMerchants },
    //           spendingTrend: monthlyStats.length >= 2
    //             ? ((monthlyStats.at(-1).spending - monthlyStats.at(-2).spending) / monthlyStats.at(-2).spending) * 100
    //             : null,
    //           incomeTotal: monthlyStats.reduce((sum, month) => sum + month.income, 0),
    //           incomeTrend: monthlyStats.length >= 2
    //             ? ((monthlyStats.at(-1).income - monthlyStats.at(-2).income) / monthlyStats.at(-2).income) * 100
    //             : null
    //         },
    //       });
    //     } catch (error) {
    //       const errorMessage =
    //         error instanceof Error ? error.message : String(error);
    //       await io.logger.error(
    //         `Error analyzing spending for user ${user.id}: ${errorMessage}`
    //       );
    //     }
    //   });
    // }

    return {
      usersAnalyzed: activeUsers.length,
    };
  },
});

/** Generate monthly spending statistics */
async function generateMonthlyStats(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  type MonthStat = {
    income: number;
    month: string;
    netCashflow: number;
    spending: number;
  };

  const months: MonthStat[] = [];
  let currentDate = startDate;

  while (currentDate < endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthLabel = format(currentDate, 'MMM yyyy');

    // Get spending for this month
    const spending = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        amount: { gt: 0 },
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        userId,
      },
    });

    // Get income for this month
    const income = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        amount: { lt: 0 }, // Negative amounts are income in Plaid
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        userId,
      },
    });

    months.push({
      income: Math.abs(income._sum.amount || 0),
      month: monthLabel,
      netCashflow:
        Math.abs(income._sum.amount || 0) - (spending._sum.amount || 0),
      spending: spending._sum.amount || 0,
    });

    // Move to next month
    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  }

  return months;
}

/** Generate category spending statistics */
async function generateCategoryStats(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // Get spending by category
  const categoryStats = await prisma.transaction.groupBy({
    _sum: {
      amount: true,
    },
    by: ['category'],
    where: {
      amount: { gt: 0 },
      category: { not: null },
      date: {
        gte: startDate,
        lte: endDate,
      },
      userId,
    },
  });

  // Get total spending
  const totalSpending = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      amount: { gt: 0 },
      date: {
        gte: startDate,
        lte: endDate,
      },
      userId,
    },
  });

  return categoryStats.map((cat) => ({
    amount: cat._sum.amount || 0,
    category: cat.category,
    percentage:
      ((cat._sum.amount || 0) / (totalSpending._sum.amount || 1)) * 100,
  }));
}

/** Get top merchants by spending */
async function getTopMerchants(userId: string, startDate: Date, endDate: Date) {
  const merchants = await prisma.transaction.groupBy({
    _sum: {
      amount: true,
    },
    by: ['merchantName'],
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
    take: 10,
    where: {
      amount: { gt: 0 },
      date: {
        gte: startDate,
        lte: endDate,
      },
      merchantName: { not: null },
      userId,
    },
  });

  return merchants.map((merchant) => ({
    amount: merchant._sum.amount || 0,
    merchantName: merchant.merchantName,
  }));
}

/** Calculate average transaction size */
async function getAverageTransactionSize(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const result = await prisma.transaction.aggregate({
    _avg: {
      amount: true,
    },
    _count: true,
    where: {
      amount: { gt: 0 },
      date: {
        gte: startDate,
        lte: endDate,
      },
      userId,
    },
  });

  return {
    avgAmount: result._avg.amount || 0,
    count: result._count,
  };
}

/** Generate insights text based on the financial data */
function generateInsightsText(
  monthlyStats: any[],
  categoryStats: any[],
  topMerchants: any[]
) {
  const insights: string[] = [];

  // Monthly trend insights
  if (monthlyStats.length >= 2) {
    const lastMonth = monthlyStats.at(-1);
    const prevMonth = monthlyStats.at(-2);

    if (lastMonth.spending > prevMonth.spending) {
      const increase = (
        ((lastMonth.spending - prevMonth.spending) / prevMonth.spending) *
        100
      ).toFixed(1);
      insights.push(
        `Your spending increased by ${increase}% compared to last month.`
      );
    } else {
      const decrease = (
        ((prevMonth.spending - lastMonth.spending) / prevMonth.spending) *
        100
      ).toFixed(1);
      insights.push(
        `Your spending decreased by ${decrease}% compared to last month.`
      );
    }
  }
  // Category insights
  if (categoryStats.length > 0) {
    const topCategory = categoryStats.sort((a, b) => b.amount - a.amount)[0];
    insights.push(
      `Your top spending category is ${topCategory.category} at ${topCategory.percentage.toFixed(1)}% of your total spending.`
    );
  }
  // Merchant insights
  if (topMerchants.length > 0) {
    insights.push(
      `You spent the most at ${topMerchants[0].merchantName} in the last 3 months.`
    );
  }

  return insights;
}

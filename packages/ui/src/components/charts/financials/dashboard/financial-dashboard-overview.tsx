'use client'
import {
  ExpenseMetrics,
  IncomeMetrics,
  Transaction,
} from 'client-typescript-sdk'
import React, { useMemo } from 'react'
import { FinancialExpenseAndIncomeMetricsConverter } from '../../../../lib/converters/expense-and-income-metrics-converter'
import { FinancialDataGenerator } from '../../../../lib/random/financial-data-generator'
import { cn } from '../../../../utils/cn'
import { Button } from '../../../button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../tabs'
import { CategoryChart } from '../categories/category-horizontal-chart'
import { NetExpenseChart } from '../expenses/net-expense-chart'
import { NetIncomeChart } from '../net-income/net-income-chart'
import { TransactionsToReview } from '../transactions/transactions-to-review'

export interface MonthlySpendingChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  title?: string
  disabled?: boolean
  transactions: Transaction[]
  expenseMetrics: ExpenseMetrics[]
  incomeMetrics: IncomeMetrics[]
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
  className,
  title,
  disabled,
  transactions: propTransactions,
  expenseMetrics: propExpenseMetrics,
  incomeMetrics: propIncomeMetrics,
  ...rest
}) => {
  const rootClassName = cn(
    'grid gap-4 w-full',
    className,
    disabled && 'opacity-50 pointer-events-none',
  )

  const expenseMetrics = useMemo(() => {
    if (disabled) {
      return FinancialDataGenerator.generateRandomExpenseMetrics(30, 2022)
    }
    return propExpenseMetrics
  }, [disabled, propExpenseMetrics])

  const incomeMetrics = useMemo(() => {
    if (disabled) {
      return FinancialDataGenerator.generateIncomeMetrics(30, 2022)
    }
    return propIncomeMetrics
  }, [disabled, propIncomeMetrics])

  const transactions = useMemo(() => {
    if (disabled) {
      return FinancialDataGenerator.generateRandomTransactions(30)
    }
    return propTransactions
  }, [disabled, propTransactions])

  const expenseByCategory = useMemo(() => {
    if (expenseMetrics && expenseMetrics.length === 0) {
      return []
    }

    const categories =
      FinancialExpenseAndIncomeMetricsConverter.computeExpenseByCategory(
        expenseMetrics,
      )
    return categories
  }, [expenseMetrics])

  const incomeByCategory = useMemo(() => {
    if (incomeMetrics && incomeMetrics.length === 0) {
      return []
    }
    const categories =
      FinancialExpenseAndIncomeMetricsConverter.computeIncomeByCategory(
        incomeMetrics,
      )
    return categories
  }, [incomeMetrics])

  const topExpenseCategories = useMemo(() => {
    if (expenseByCategory.length === 0) {
      return []
    }
    return expenseByCategory
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((category) => ({
        name: category.category,
        total: category.value.toFixed(2),
      }))
  }, [expenseByCategory])

  return (
    <div {...rest} className={rootClassName}>
      {title && <h2 className="mb-4 text-xl font-bold sm:text-2xl">{title}</h2>}

      <Tabs defaultValue="spending">
        <TabsList className="grid w-fit grid-cols-2 rounded-2xl">
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="spending" className="min-w-full">
          {/* Monthly spending chart */}
          <div className="min-h-64 rounded-lg py-4 sm:min-h-96">
            <NetExpenseChart
              disabled={disabled}
              expenseMetrics={expenseMetrics}
              currency={'USD'}
              title={'Net Expense'}
              price={1000}
              priceChange={20}
            />
            {/* Add your chart component here */}
          </div>
        </TabsContent>
        <TabsContent value="income" className="min-w-full">
          {/* Monthly income chart */}
          <div className="min-h-64 rounded-lg py-4 sm:min-h-96">
            <NetIncomeChart
              disabled={disabled}
              incomeMetrics={incomeMetrics}
              currency={'USD'}
              title={'Net Income'}
              price={1000}
              priceChange={20}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* New scrollable component for top expense categories */}
      <div className="mb-2 flex items-center gap-3">
        <h3 className="text-lg font-semibold">
          Spending Across Top Categories
        </h3>
        <span className="text-md font-bold md:text-3xl">
          $
          {topExpenseCategories
            .reduce((sum, category) => sum + parseFloat(category.total), 0)
            .toFixed(2)}
        </span>
      </div>
      <div className="scrollbar-hide w-full overflow-x-auto">
        <div className="flex w-max space-x-2 p-2">
          {topExpenseCategories.map((category, index) => (
            <div key={index} className="flex-shrink-0">
              <Button
                variant="secondary"
                className="text-md flex items-center whitespace-nowrap"
              >
                <span className="text-md mr-3 font-bold">{category.name}</span>
                <span className="bg-secondary-foreground/10 rounded px-2 py-1 text-xs font-bold">
                  ${category.total}
                </span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Accounts, top categories, and transaction to review */}
      <div className="grid gap-4">
        {expenseByCategory && incomeByCategory && (
          <div className="grid grid-cols-2 rounded-lg p-4 md:h-full">
            <div className="mt-6">
              <CategoryChart
                data={expenseByCategory}
                title={'Top Expense Category'}
                description={'Expense by Category over time'}
              />
            </div>
            <div className="mt-6">
              <CategoryChart
                data={incomeByCategory}
                title={'Top Income Category'}
                description={'Income by Category over time'}
              />
            </div>
          </div>
        )}
        <div>
          {transactions && (
            <div className="rounded-lg py-4 md:h-full">
              <TransactionsToReview transactions={transactions} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

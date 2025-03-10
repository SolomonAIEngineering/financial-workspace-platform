import { Meta, StoryFn } from "@storybook/react";
import {
    MonthlyTransactions,
    TransactionRow,
    TransactionsByMonth,
} from "./transactions-chart";

import React from "react";
import { Transaction } from "client-typescript-sdk";

export default {
    title: "Charts/Transactions",
    component: TransactionsByMonth,
    parameters: {
        layout: "centered",
    },
} as Meta;

// Sample transaction data
const sampleTransactions: Transaction[] = [
    {
        id: "1",
        accountId: "ACC-001",
        amount: 125.75,
        name: "Grocery Store",
        currentDate: "2023-07-15T09:30:00Z",
        personalFinanceCategoryPrimary: "FOOD_AND_DRINK",
    },
    {
        id: "2",
        accountId: "ACC-001",
        amount: 45.99,
        name: "Gas Station",
        currentDate: "2023-07-17T14:15:00Z",
        personalFinanceCategoryPrimary: "TRANSPORTATION",
    },
    {
        id: "3",
        accountId: "ACC-002",
        amount: 85.50,
        name: "Restaurant",
        currentDate: "2023-07-20T19:45:00Z",
        personalFinanceCategoryPrimary: "FOOD_AND_DRINK",
    },
    {
        id: "4",
        accountId: "ACC-002",
        amount: 199.99,
        name: "Electronics Store",
        currentDate: "2023-08-05T11:20:00Z",
        personalFinanceCategoryPrimary: "SHOPPING",
    },
    {
        id: "5",
        accountId: "ACC-001",
        amount: 75.00,
        name: "Utility Bill",
        currentDate: "2023-08-10T08:00:00Z",
        personalFinanceCategoryPrimary: "UTILITIES",
    },
];

// Group transactions by month
const transactionsByMonth: Record<string, Transaction[]> = {
    "July 2023": sampleTransactions.slice(0, 3),
    "August 2023": sampleTransactions.slice(3),
};

const TransactionsByMonthTemplate: StoryFn<{ transactionsByMonth: Record<string, Transaction[]> }> = (args) => (
    <div className="w-[900px]">
        <TransactionsByMonth {...args} />
    </div>
);

export const Default = TransactionsByMonthTemplate.bind({});
Default.args = {
    transactionsByMonth: transactionsByMonth,
};

const MonthlyTransactionsTemplate: StoryFn<{ month: string; transactions: Transaction[] }> = (args) => (
    <div className="w-[900px]">
        <MonthlyTransactions {...args} />
    </div>
);

export const SingleMonth = MonthlyTransactionsTemplate.bind({});
SingleMonth.args = {
    month: "July 2023",
    transactions: transactionsByMonth["July 2023"],
};

const TransactionRowTemplate: StoryFn<{ transaction: Transaction }> = (args) => (
    <div className="w-[900px]">
        <table>
            <tbody>
                <TransactionRow {...args} />
            </tbody>
        </table>
    </div>
);

export const SingleTransaction = TransactionRowTemplate.bind({});
SingleTransaction.args = {
    transaction: sampleTransactions[0],
}; 
import { BankAccount } from '@solomonai/prisma';

// Transaction type definition
export interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    category: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface SingleBankAccountProps {
    bankAccount: BankAccount;
}

export interface MonthlyStats {
    spending: string;
    income: string;
    netChange: string;
    percentChange: number;
}

export interface ChartData {
    labels: string[];
    values: number[];
}

export type ChartType = 'bar' | 'line' | 'sphere';
export type DateRangeType = '7d' | '30d' | '90d' | 'ytd'; 
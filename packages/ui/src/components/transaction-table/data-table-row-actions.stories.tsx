import { Meta, StoryFn } from "@storybook/react";

import { DataTableRowActions } from "./data-table-row-actions";
import React from "react";
import { Row } from "@tanstack/react-table";

// Create a mock row for the story
const createMockRow = (data) => {
    const mockData = {
        id: "txn-001",
        amount: 125.50,
        date: new Date("2023-04-15"),
        description: "Office Supplies",
        category: "Business",
        ...data
    };

    return {
        original: mockData,
        getValue: (key) => mockData[key]
    } as unknown as Row<unknown>;
};

export default {
    component: DataTableRowActions,
    title: "TransactionTable/DataTableRowActions",
    parameters: {
        layout: "centered",
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="p-4 flex justify-center">
        <DataTableRowActions
            row={createMockRow(args.transactionData)}
        />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    transactionData: {
        id: "txn-001",
        amount: 125.50,
        date: new Date("2023-04-15"),
        description: "Office Supplies",
        category: "Business",
        status: "completed"
    }
};

export const PendingTransaction = Template.bind({});
PendingTransaction.args = {
    transactionData: {
        id: "txn-002",
        amount: 75.20,
        date: new Date("2023-04-16"),
        description: "Client Lunch",
        category: "Food & Dining",
        status: "pending"
    }
}; 
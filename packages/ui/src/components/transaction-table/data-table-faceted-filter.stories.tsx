import {
    CarIcon,
    CreditCardIcon,
    DollarSignIcon,
    HomeIcon,
    ShoppingCartIcon
} from "lucide-react";
import { Meta, StoryFn } from "@storybook/react";

import { Column } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import React from "react";

// Mock column for the story
const createMockColumn = () => ({
    getFilterValue: () => [],
    setFilterValue: () => { },
    getIsFiltered: () => false,
} as unknown as Column<unknown, unknown>);

export default {
    component: DataTableFacetedFilter,
    title: "TransactionTable/DataTableFacetedFilter",
    parameters: {
        layout: "centered",
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="p-4 border rounded w-[300px]">
        <DataTableFacetedFilter
            column={createMockColumn()}
            title={args.title}
            options={args.options}
        />
    </div>
);

export const Categories = Template.bind({});
Categories.args = {
    title: "Categories",
    options: [
        {
            label: "Food & Dining",
            value: "food",
            icon: ShoppingCartIcon,
        },
        {
            label: "Transportation",
            value: "transportation",
            icon: CarIcon,
        },
        {
            label: "Housing",
            value: "housing",
            icon: HomeIcon,
        },
        {
            label: "Bills & Utilities",
            value: "bills",
            icon: DollarSignIcon,
        },
        {
            label: "Credit Card",
            value: "credit",
            icon: CreditCardIcon,
        },
    ],
};

export const PaymentMethods = Template.bind({});
PaymentMethods.args = {
    title: "Payment Method",
    options: [
        {
            label: "Credit Card",
            value: "credit_card",
        },
        {
            label: "Debit Card",
            value: "debit_card",
        },
        {
            label: "Cash",
            value: "cash",
        },
        {
            label: "Bank Transfer",
            value: "bank_transfer",
        },
        {
            label: "PayPal",
            value: "paypal",
        },
    ],
}; 
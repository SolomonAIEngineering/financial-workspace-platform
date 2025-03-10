import { Meta, StoryFn } from "@storybook/react";

import DropTableCell from "./drop-table-cell";
import React from "react";

export default {
    component: DropTableCell,
    title: "Planner/DropTableCell",
    parameters: {
        layout: "centered",
    },
    argTypes: {
        resourceId: { control: "text" },
        columnIndex: { control: "number" },
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="w-[400px]">
        <table className="border-collapse">
            <tbody>
                <tr>
                    <DropTableCell resourceId={""} columnIndex={0} {...args}>
                        <div className="h-20 w-full p-2">
                            Cell Content
                        </div>
                    </DropTableCell>
                </tr>
            </tbody>
        </table>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    resourceId: "resource-1",
    columnIndex: 0,
};

export const WithCustomContent = Template.bind({});
WithCustomContent.args = {
    resourceId: "resource-2",
    columnIndex: 1,
    children: (
        <div className="h-20 w-full p-2 bg-blue-100 flex items-center justify-center">
            Custom Cell Content
        </div>
    ),
}; 
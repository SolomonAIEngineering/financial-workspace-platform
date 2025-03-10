import { Meta, StoryFn } from "@storybook/react";

import Appointment from "./appointment";
import React from "react";

export default {
    component: Appointment,
    title: "Planner/Appointment",
    parameters: {
        layout: "centered",
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="w-[400px] p-4 bg-gray-100">
        <Appointment appointment={args.appointment} resourceId={args.resourceId} columnIndex={args.columnIndex} {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    appointment: {
        id: "1",
        title: "Meeting with Client",
        start: new Date(2023, 6, 15, 10, 0),
        end: new Date(2023, 6, 15, 11, 30),
        resourceId: "resource-1",
        description: "Discuss project requirements and timeline",
        category: "meeting",
    },
    resourceId: "resource-1",
    columnIndex: 0,
};

export const ShortAppointment = Template.bind({});
ShortAppointment.args = {
    appointment: {
        id: "2",
        title: "Quick Call",
        start: new Date(2023, 6, 15, 14, 0),
        end: new Date(2023, 6, 15, 14, 15),
        resourceId: "resource-2",
        description: "Follow-up on action items",
        category: "call",
    },
    resourceId: "resource-2",
    columnIndex: 1,
}; 
import type { Meta, StoryObj } from "@storybook/react";

import { TimeRangeInput } from "./time-range-input";
import { useState } from "react";

const meta: Meta<typeof TimeRangeInput> = {
    component: TimeRangeInput,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof TimeRangeInput>;

export const Default: Story = {
    render: () => {
        const [timeRange, setTimeRange] = useState({
            startTime: "09:00",
            endTime: "17:00",
        });

        return (
            <TimeRangeInput
                startTime={timeRange.startTime}
                endTime={timeRange.endTime}
                onStartTimeChange={(time) =>
                    setTimeRange({ ...timeRange, startTime: time })
                }
                onEndTimeChange={(time) => setTimeRange({ ...timeRange, endTime: time })}
            />
        );
    },
};

export const WithLabel: Story = {
    render: () => {
        const [timeRange, setTimeRange] = useState({
            startTime: "10:00",
            endTime: "15:30",
        });

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium">Operating Hours</label>
                <TimeRangeInput
                    startTime={timeRange.startTime}
                    endTime={timeRange.endTime}
                    onStartTimeChange={(time) =>
                        setTimeRange({ ...timeRange, startTime: time })
                    }
                    onEndTimeChange={(time) =>
                        setTimeRange({ ...timeRange, endTime: time })
                    }
                />
            </div>
        );
    },
};

export const WithError: Story = {
    render: () => {
        const [timeRange, setTimeRange] = useState({
            startTime: "18:00",
            endTime: "09:00",
        });

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium">Operating Hours</label>
                <TimeRangeInput
                    startTime={timeRange.startTime}
                    endTime={timeRange.endTime}
                    onStartTimeChange={(time) =>
                        setTimeRange({ ...timeRange, startTime: time })
                    }
                    onEndTimeChange={(time) =>
                        setTimeRange({ ...timeRange, endTime: time })
                    }
                />
                <p className="text-sm text-red-500">
                    End time must be after start time
                </p>
            </div>
        );
    },
};

export const Disabled: Story = {
    render: () => (
        <TimeRangeInput
            startTime="08:00"
            endTime="16:00"
            onStartTimeChange={() => { }}
            onEndTimeChange={() => { }}
            disabled
        />
    ),
}; 
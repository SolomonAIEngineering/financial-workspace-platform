import type { Meta, StoryObj } from "@storybook/react";
import TableSkeleton from "./table-skeleton";

const meta: Meta<typeof TableSkeleton> = {
  component: TableSkeleton,
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
};

export default meta;
type Story = StoryObj<typeof TableSkeleton>;

export const Default: Story = {};

export const CustomHeight: Story = {
  render: () => (
    <div style={{ height: "400px" }}>
      <TableSkeleton />
    </div>
  ),
};

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./card";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Card> = {
    component: Card,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>Deploy your new project in one-click.</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Name of your project" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="framework">Framework</Label>
                            <Input id="framework" placeholder="React, Vue, etc." />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Deploy</Button>
            </CardFooter>
        </Card>
    ),
};

export const SimpleCard: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Notification</CardTitle>
                <CardDescription>You have a new message.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>The project "Design System" was updated.</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full">View</Button>
            </CardFooter>
        </Card>
    ),
};

export const ImageCard: Story = {
    render: () => (
        <Card className="w-[350px] overflow-hidden">
            <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image placeholder</span>
            </div>
            <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Work together seamlessly.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Share documents, tasks, and communicate in real-time.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost">Share</Button>
                <Button variant="outline">Learn More</Button>
            </CardFooter>
        </Card>
    ),
}; 
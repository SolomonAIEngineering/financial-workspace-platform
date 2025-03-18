import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
    component: Tabs,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
    render: () => (
        <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-4">
                <p>Account tab content</p>
                <p className="text-sm text-gray-500 mt-2">
                    Manage your account settings and preferences.
                </p>
            </TabsContent>
            <TabsContent value="password" className="p-4">
                <p>Password tab content</p>
                <p className="text-sm text-gray-500 mt-2">
                    Change your password and security settings.
                </p>
            </TabsContent>
        </Tabs>
    ),
};

export const VerticalTabs: Story = {
    render: () => (
        <Tabs defaultValue="music" orientation="vertical" className="w-[400px]">
            <TabsList className="w-1/3">
                <TabsTrigger value="music" className="w-full">Music</TabsTrigger>
                <TabsTrigger value="videos" className="w-full">Videos</TabsTrigger>
                <TabsTrigger value="photos" className="w-full">Photos</TabsTrigger>
            </TabsList>
            <TabsContent value="music" className="p-4 flex-1">
                <p>Music tab content</p>
                <p className="text-sm text-gray-500 mt-2">
                    Browse and organize your music collection.
                </p>
            </TabsContent>
            <TabsContent value="videos" className="p-4 flex-1">
                <p>Videos tab content</p>
                <p className="text-sm text-gray-500 mt-2">
                    Watch and manage your videos.
                </p>
            </TabsContent>
            <TabsContent value="photos" className="p-4 flex-1">
                <p>Photos tab content</p>
                <p className="text-sm text-gray-500 mt-2">
                    View and organize your photo library.
                </p>
            </TabsContent>
        </Tabs>
    ),
}; 
import { Meta, StoryObj } from "@storybook/react";

import { Footer } from "./footer";

const meta: Meta<typeof Footer> = {
    title: "Navigation/CollapsibleSidebar/Footer",
    component: Footer,
    parameters: {
        layout: "centered",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        className: { control: "text" },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
    args: {
        description: "© 2023 Company Inc.",
        className: "border-t p-4 bg-white",
        children: (
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">© 2023 Company Inc.</div>
                <div className="flex space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                        <span className="sr-only">Light/Dark Mode</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-100">
                        <span className="sr-only">Help</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        ),
    },
};

export const Collapsed: Story = {
    args: {
        className: "border-t p-4 bg-white",
        children: (
            <div className="flex flex-col items-center space-y-2">
                <button className="p-1 rounded-full hover:bg-gray-100">
                    <span className="sr-only">Light/Dark Mode</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                </button>
                <button className="p-1 rounded-full hover:bg-gray-100">
                    <span className="sr-only">Help</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        ),
    },
};

export const WithUserProfile: Story = {
    args: {
        className: "border-t p-4 bg-white",
        children: (
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-xs text-gray-500">Administrator</div>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        ),
    },
}; 
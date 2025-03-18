import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    GearIcon,
    PersonIcon,
    RocketIcon,
} from "@radix-ui/react-icons";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "./command";
import { Dialog, DialogContent } from "./dialog";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { useState } from "react";

const meta = {
    title: 'UI/Command',
    component: Command,
    tags: ["autodocs"],
} as Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {
    render: () => (
        <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                        <FaceIcon className="mr-2 h-4 w-4" />
                        <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                        <RocketIcon className="mr-2 h-4 w-4" />
                        <span>Launch</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem>
                        <PersonIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </CommandItem>
                    <CommandItem>
                        <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                        <span>Mail</span>
                    </CommandItem>
                    <CommandItem>
                        <GearIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};

export const DialogExample: Story = {
    render: () => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className="w-[200px] justify-start text-sm text-muted-foreground"
                >
                    <span>Press </span>
                    <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="overflow-hidden p-0 max-w-[740px]">
                        <Command className="h-[480px]">
                            <CommandInput placeholder="Type a command or search..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    <CommandItem>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span>Calendar</span>
                                    </CommandItem>
                                    <CommandItem>
                                        <FaceIcon className="mr-2 h-4 w-4" />
                                        <span>Search Emoji</span>
                                    </CommandItem>
                                    <CommandItem>
                                        <RocketIcon className="mr-2 h-4 w-4" />
                                        <span>Launch</span>
                                    </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup heading="Settings">
                                    <CommandItem>
                                        <PersonIcon className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                        <CommandShortcut>⌘P</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem>
                                        <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                                        <span>Mail</span>
                                        <CommandShortcut>⌘B</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem>
                                        <GearIcon className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                        <CommandShortcut>⌘S</CommandShortcut>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </DialogContent>
                </Dialog>
            </>
        );
    },
};

export const SearchResults: Story = {
    render: () => (
        <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search for files..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Documents">
                    <CommandItem>
                        <span>annual_report_2023.pdf</span>
                        <CommandShortcut>5 days ago</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <span>presentation_v2.pptx</span>
                        <CommandShortcut>Yesterday</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <span>budget_2024.xlsx</span>
                        <CommandShortcut>2 hours ago</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Images">
                    <CommandItem>
                        <span>profile_picture.png</span>
                        <CommandShortcut>1 week ago</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                        <span>screenshot_2023-12-15.jpg</span>
                        <CommandShortcut>3 days ago</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
}; 
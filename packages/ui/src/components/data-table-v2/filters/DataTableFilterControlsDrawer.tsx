"use client";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../../../primitives/drawer";
import React, { useState } from "react";

import { Button } from "../../../primitives/button";
import { DataTableFilterControls } from "./DataTableFilterControls";
import { Filter } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDataTable } from "../core/DataTableProvider";

/**
 * Props for the DataTableFilterControlsDrawer component
 */
export interface DataTableFilterControlsDrawerProps {
    /**
     * Optional custom class name for the drawer trigger button
     */
    className?: string;

    /**
     * Optional title to display in the drawer header
     * @default "Filters"
     */
    title?: string;

    /**
     * Optional icon to use in the trigger button
     * @default Filter icon from lucide-react
     */
    icon?: React.ReactNode;

    /**
     * Optional text to display in the trigger button
     * @default "Filters"
     */
    triggerText?: string;

    /**
     * Optional custom button variant
     * @default "outline"
     */
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

    /**
     * Optional custom button size
     * @default "sm"
     */
    buttonSize?: "default" | "sm" | "lg" | "icon";
}

/**
 * A drawer component that contains filter controls for mobile/small screens
 * 
 * @example
 * ```tsx
 * <DataTableFilterControlsDrawer 
 *   title="Table Filters"
 *   triggerText="Open Filters"
 * />
 * ```
 */
export function DataTableFilterControlsDrawer({
    className,
    title = "Filters",
    icon,
    triggerText = "Filters",
    buttonVariant = "outline",
    buttonSize = "sm",
}: DataTableFilterControlsDrawerProps) {
    const { filterFields } = useDataTable();
    const [open, setOpen] = useState(false);

    // If there are no filter fields, don't render anything
    if (!filterFields?.length) {
        return null;
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    className={cn("gap-1", className)}
                    aria-label="Open filters drawer"
                    data-testid="data-table-filter-drawer-trigger"
                >
                    {icon || <Filter className="h-4 w-4" />}
                    {triggerText}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-2">
                    <DataTableFilterControls />
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
} 
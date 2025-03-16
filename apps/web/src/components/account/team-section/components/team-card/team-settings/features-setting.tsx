/**
 * Team features setting component
 *
 * @file Team Features Setting Component
 */

import { Check, ChevronsUpDown, Tag, Tags } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/registry/default/potion-ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/default/potion-ui/popover';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TeamFeaturesSettingProps } from '../../../types';
import { cn } from '@/lib/utils';
import { commonFlags } from '../../../utils';
import { useState } from 'react';

/**
 * Component for managing a team's feature flags
 * 
 * Allows team owners to enable or disable specific features for the team.
 * Non-owners can view enabled features but cannot modify them.
 *
 * @param props - Component properties
 * @param props.flags - Currently enabled feature flags
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onFlagsUpdate - Handler for updating feature flags
 * @param props.isUpdating - Whether updates are in progress
 * @returns Component for managing team features
 * 
 * @example
 * ```tsx
 * <TeamFeaturesSetting
 *   flags={team.flags || []}
 *   isOwner={isOwner}
 *   onFlagsUpdate={handleFlagsUpdate}
 *   isUpdating={isUpdating}
 * />
 * ```
 */
export function TeamFeaturesSetting({
    flags,
    isOwner,
    onFlagsUpdate,
    isUpdating
}: TeamFeaturesSettingProps) {
    const [flagsOpen, setFlagsOpen] = useState(false);

    /**
     * Handles feature flag toggling
     */
    const handleFlagToggle = (flagId: string) => {
        if (isUpdating) return;

        const isSelected = flags.includes(flagId);
        const newFlags = isSelected
            ? flags.filter(f => f !== flagId)
            : [...flags, flagId];

        onFlagsUpdate(newFlags);
    };

    return (
        <div className="space-y-1">
            <h4 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-1.5">
                Team Features
                <InfoTooltip
                    title="Team Features"
                    description="Enable or disable specific features for this team. Some features may affect your billing or require additional setup."
                    size="sm"
                />
            </h4>
            {isOwner ? (
                <Popover open={flagsOpen} onOpenChange={setFlagsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={flagsOpen}
                            className="w-full justify-between bg-background/70 hover:bg-background/90 h-8 px-3"
                            disabled={isUpdating}
                        >
                            <div className="flex items-center">
                                <Tags className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <span>
                                    {flags.length > 0
                                        ? `${flags.length} feature${flags.length > 1 ? 's' : ''}`
                                        : 'No features enabled'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0">
                        <Command>
                            <CommandInput placeholder="Search features..." />
                            <CommandEmpty>No features found</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                                {commonFlags.map((flag) => (
                                    <CommandItem
                                        key={flag.id}
                                        value={flag.id}
                                        onSelect={() => handleFlagToggle(flag.id)}
                                    >
                                        <div className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                                            flags.includes(flag.id)
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-muted-foreground"
                                        )}>
                                            {flags.includes(flag.id) && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </div>
                                        <span>{flag.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            ) : (
                <div className="flex flex-wrap gap-1">
                    {flags.length > 0 ? (
                        flags.map(flag => {
                            const flagInfo = commonFlags.find(f => f.id === flag) || { id: flag, name: flag };
                            return (
                                <Badge variant="outline" key={flag} className="bg-muted/40">
                                    <Tag className="mr-1 h-3 w-3" />
                                    {flagInfo.name}
                                </Badge>
                            );
                        })
                    ) : (
                        <span className="text-sm text-muted-foreground">No features enabled</span>
                    )}
                </div>
            )}
        </div>
    );
} 
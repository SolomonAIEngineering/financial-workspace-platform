/**
 * Header component for the team settings section
 *
 * @file Team Header Component
 */

import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Icons } from '@/components/ui/icons';
import { TeamHeaderProps } from '../types';

/**
 * Renders the header section of the team management interface
 * 
 * This component displays the title, description and loading indicator
 * for the team management section.
 *
 * @param props - Component properties
 * @param props.isLoading - Whether data is currently being loaded
 * @returns A header component for the team settings card
 *
 * @example
 * ```tsx
 * <TeamHeader isLoading={isLoading} />
 * ```
 */
export function TeamHeader({ isLoading }: TeamHeaderProps) {
    return (
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Icons.user className="h-5 w-5 text-primary" />
                Team Settings
                {isLoading && <Icons.spinner className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <CardDescription>
                Manage your team memberships and configure team-specific settings
            </CardDescription>
        </CardHeader>
    );
} 
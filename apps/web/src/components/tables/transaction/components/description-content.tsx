import * as React from 'react';

import { FileText, MapPin, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DescriptionContentProps {
    description?: string;
    location?: string;
    tags?: string[];
}

export function DescriptionContent({
    description,
    location,
    tags,
}: DescriptionContentProps) {
    return (
        <div className="space-y-5">
            {/* Description section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Description</span>
                </div>
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                    {description || 'No description available for this transaction.'}
                </div>
            </div>

            {/* Location section (if provided) */}
            {location && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Location</span>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3 text-sm flex items-center gap-2">
                        <span>{location}</span>
                    </div>
                </div>
            )}

            {/* Tags section (if provided) */}
            {tags && tags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className={cn(
                                    "text-xs px-2 py-1",
                                    "bg-blue-100/70 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300"
                                )}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 
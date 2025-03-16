/**
 * Team slug setting component
 *
 * @file Team Slug Setting Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { Check } from 'lucide-react';
import { Icons } from '@/components/ui/icons';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/registry/default/potion-ui/input';
import { TeamSlugSettingProps } from '../../../types';
import { useState } from 'react';
import { validateTeamSlug } from '../../../utils';

/**
 * Component for managing a team's slug setting
 *
 * Allows team owners to view and edit the team's slug (URL identifier), with
 * validation and error handling.
 *
 * @example
 *   ```tsx
 *   <TeamSlugSetting
 *     teamSlug={team.slug}
 *     isOwner={isOwner}
 *     onSlugUpdate={handleSlugUpdate}
 *     isUpdating={isUpdating}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.teamSlug - Current team slug
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onSlugUpdate - Handler for slug updates
 * @param props.isUpdating - Whether slug updates are in progress
 * @returns Component for managing team slug
 */
export function TeamSlugSetting({
  teamSlug,
  isOwner,
  onSlugUpdate,
  isUpdating,
}: TeamSlugSettingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(teamSlug || '');
  const [slugError, setSlugError] = useState('');

  /** Validates the slug and updates error state */
  const validateSlug = (value: string) => {
    const { isValid, errorMessage } = validateTeamSlug(value);
    setSlugError(errorMessage);
    return isValid;
  };

  /** Handles the slug update submission */
  const handleSubmit = async () => {
    if (!validateSlug(slug) || slug === teamSlug) {
      setIsEditing(false);
      setSlug(teamSlug || '');
      return;
    }

    try {
      await onSlugUpdate(slug);
      setIsEditing(false);
    } catch (error: any) {
      if (error.message?.includes('unique constraint')) {
        setSlugError('This slug is already taken');
      }
    }
  };

  return (
    <div className="space-y-1">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
        Team Slug
        <InfoTooltip
          title="Team Slug"
          description="A unique identifier for your team used in URLs. Only lowercase letters, numbers, and hyphens are allowed."
          size="sm"
        />
      </h4>
      {isOwner ? (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  validateSlug(e.target.value);
                }}
                className="h-8 text-sm"
                placeholder="team-slug"
                maxLength={50}
                disabled={isUpdating}
              />
              <Button
                size="sm"
                className="h-8 px-2"
                onClick={handleSubmit}
                disabled={isUpdating || !!slugError}
              >
                {isUpdating ? (
                  <Icons.spinner className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          ) : (
            <>
              <code className="rounded bg-muted px-2 py-1 text-sm">
                {teamSlug || 'no-slug-set'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Icons.edit className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ) : (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {teamSlug || 'no-slug-set'}
        </code>
      )}
      {slugError && <p className="text-xs text-red-500">{slugError}</p>}
    </div>
  );
}

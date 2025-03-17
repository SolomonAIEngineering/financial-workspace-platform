/**
 * Sheet component for team creation
 *
 * @file Team Creation Sheet Component
 */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/registry/default/potion-ui/sheet';

import { TeamCreationForm } from '@/components/form/team-creation-form';
import { Users } from 'lucide-react';

interface TeamCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (team?: any) => Promise<void>;
}

export function TeamCreationSheet({
  open,
  onOpenChange,
  onSuccess,
}: TeamCreationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create a New Team
          </SheetTitle>
          <SheetDescription>
            Set up a team to collaborate with others and manage your
            organizational finances.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <TeamCreationForm
            onSuccess={(team) => {
              onSuccess(team);
              onOpenChange(false);
            }}
            isDialog={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

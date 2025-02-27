'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';
import { PencilLineIcon } from 'lucide-react';

import { useAuthGuard } from '@/components/auth/useAuthGuard';
import { ExtendedSuggestionPlugin } from '@/components/editor/plugins/suggestion/ExtendedSuggestionPlugin';
import { ToolbarButton } from '@/registry/default/potion-ui/toolbar';

export function SuggestionToolbarButton() {
  const { setOption } = useEditorPlugin(ExtendedSuggestionPlugin);
  const isSuggesting = usePluginOption(
    ExtendedSuggestionPlugin,
    'isSuggesting'
  );
  const authGuard = useAuthGuard();

  return (
    <ToolbarButton
      className={cn(isSuggesting && 'text-brand/80 hover:text-brand/80')}
      onClick={() => authGuard(() => setOption('isSuggesting', !isSuggesting))}
      onMouseDown={(e) => e.preventDefault()}
      tooltip={isSuggesting ? 'Turn off suggesting' : 'Suggestion edits'}
    >
      <PencilLineIcon />
    </ToolbarButton>
  );
}

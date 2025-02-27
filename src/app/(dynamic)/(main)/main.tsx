'use client';

import { useEditorScrollRef } from '@udecode/plate/react';

import { SearchCommand } from '@/components/search/search-command';

export function Main({ children }: { children: React.ReactNode }) {
  const ref = useEditorScrollRef();

  return (
    <main
      id="scroll_container"
      ref={ref}
      className="hide-scrollbar relative h-[calc(100vh-44px-2px)] overflow-y-auto"
    >
      <SearchCommand />
      {children}
    </main>
  );
}

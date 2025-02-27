'use client';

import { useEffect, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useDocumentId } from '@/lib/navigation/routes';
import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';
import { useUpdateDocumentTitle } from '@/trpc/hooks/document-hooks';
import { useDocumentQueryOptions } from '@/trpc/hooks/query-options';

import { useAuthGuard } from '../auth/useAuthGuard';
import { getTemplateDocument } from '../editor/utils/useTemplateDocument';
import { Skeleton } from '../ui/skeleton';

export const NavTitle = () => {
  const authGuard = useAuthGuard();
  const documentId = useDocumentId();
  const containerRef = useRef<HTMLDivElement>(null);

  const queryOptions = useDocumentQueryOptions();
  const { data: _title, isLoading } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.title,
  });
  const title = queryOptions.enabled
    ? _title
    : getTemplateDocument(documentId)?.title;

  const { data: icon } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.icon,
  });

  const { data: isArchived } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.isArchived,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const updateTitle = useUpdateDocumentTitle();

  // Add shine effect on focus for glass containers
  useEffect(() => {
    if (isFocused && containerRef.current) {
      containerRef.current.classList.add('shine-effect');
    } else if (containerRef.current) {
      containerRef.current.classList.remove('shine-effect');
    }
  }, [isFocused]);

  // Include ShineEffectStyles
  useEffect(() => {
    // Create shine effect styles
    if (!document.getElementById('shine-effect-styles')) {
      const style = document.createElement('style');
      style.id = 'shine-effect-styles';
      style.textContent = `
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            rgba(255, 255, 255, 0) 10%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0) 30%
          );
          transform: rotate(30deg);
          animation: shine 2s ease-in-out infinite;
        }
        @keyframes shine {
          from { transform: translateX(-100%) rotate(30deg); }
          to { transform: translateX(100%) rotate(30deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const enableInput = () => {
    if (isArchived) return;

    setIsEditing(true);
    setIsFocused(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = title ?? '';
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
    setIsHovering(false);
    setIsFocused(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle({ id: documentId, title: e.target.value });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      disableInput();
    } else if (e.key === 'Escape') {
      disableInput();
    }
  };

  if (isLoading) {
    return <NavTitleSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      className={`glass-container flex items-center gap-x-2 rounded-full px-3 py-1.5 transition-all duration-300 ${isEditing || isFocused ? 'scale-[1.02] bg-white/80 shadow-md dark:bg-slate-800/80' : 'hover:scale-[1.01] hover:shadow-md'} ${isArchived ? 'opacity-75' : ''} `}
      onMouseEnter={() => !isArchived && setIsHovering(true)}
      onMouseLeave={() => {
        if (!isEditing && !isFocused) {
          setIsHovering(false);
        }
      }}
    >
      {!!icon && (
        <span
          className={`flex items-center justify-center text-lg transition-all duration-200 select-none ${isEditing || isHovering || isFocused ? 'scale-110 text-brand' : ''} ${isArchived ? 'opacity-50' : ''} `}
        >
          {icon}
        </span>
      )}
      {isEditing ? (
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            variant="flat"
            className="h-8 w-full border-none bg-transparent px-2 pr-14 font-medium transition-all duration-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onBlur={disableInput}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={onKeyDown}
            placeholder="Untitled"
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 animate-pulse text-[10px] whitespace-nowrap text-muted-foreground/75">
            Enter ↵
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className={`line-clamp-1 h-auto rounded-md px-2 py-1.5 transition-all duration-200 ${isHovering ? 'text-brand' : ''} ${isArchived ? 'cursor-default opacity-75' : ''} group relative hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0`}
          onBlur={() => setIsFocused(false)}
          onClick={() => !isArchived && authGuard(enableInput)}
          onFocus={() => setIsFocused(true)}
        >
          <div
            className={`w-[380px] truncate text-left font-medium ${!title ? 'text-muted-foreground italic' : ''}`}
          >
            {title || 'Untitled'}
          </div>
          {isHovering && !isArchived && (
            <span className="absolute top-1/2 right-1 -translate-y-1/2 text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              ✏️
            </span>
          )}
          {isArchived && (
            <span className="absolute top-1/2 right-1 -translate-y-1/2 text-xs text-muted-foreground">
              (Archived)
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export function NavTitleSkeleton() {
  return (
    <div className="glass-container flex animate-pulse items-center gap-x-2 rounded-full px-3 py-1.5">
      <Skeleton className="mr-2 h-[28px] w-5 rounded-full" />
      <Skeleton className="h-[28px] w-[180px] rounded-md" />
    </div>
  );
}

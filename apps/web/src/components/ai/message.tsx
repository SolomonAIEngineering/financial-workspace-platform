'use client';

import { CodeBlock } from '@/components/ui/codeblock';
import { Icons } from '@/components/ui/icons';
import { MemoizedReactMarkdown } from '@/components/chat/markdown';
import { Spinner } from '@/registry/default/potion-ui/spinner';
import type { StreamableValue } from 'ai/rsc';
import { cn } from '@udecode/cn';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { useStreamableText } from '@/components/ai/utils/useStreamableText';

// Different types of message bubbles.

export function UserMessage({
  children,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs select-none">
        <Icons.user />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  className,
  content,
}: {
  content: StreamableValue<string> | string;
  className?: string;
}) {
  const text = useStreamableText(content);

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-[25px] shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs select-none">
        <Icons.ai className="size-6" />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words"
          components={{
            code({ children, className, node, ...props }) {
              if (Array.isArray(children) && children.length > 0) {
                const firstChild = children[0];

                if (typeof firstChild === 'string') {
                  if (firstChild === '▍') {
                    return (
                      <span className="mt-1 animate-pulse cursor-default">
                        ▍
                      </span>
                    );
                  }

                  children[0] = firstChild.replace('`▍`', '▍');
                }
              }

              const match = /language-(\w+)/.exec(className || '');

              return match ? (
                <CodeBlock
                  key={Math.random()}
                  value={String(children).replace(/\n$/, '')}
                  language={match?.[1] || ''}
                  {...props}
                />
              ) : (
                <code
                  className={className}
                  {...(props as React.HTMLAttributes<HTMLElement>)}
                >
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
          }}
          remarkPlugins={[remarkGfm, remarkMath]}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
    </div>
  );
}

export function BotCard({
  children,
  showAvatar = true,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[25px] shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs select-none',
          !showAvatar && 'invisible'
        )}
      >
        <img className="size-6" alt="gemini logo" src="/images/gemini.png" />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  );
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
      <div className="max-w-[600px] flex-initial p-2">{children}</div>
    </div>
  );
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 items-center justify-center rounded-lg border bg-background shadow-xs select-none">
        <Icons.ai className="size-6" />
      </div>
      <div className="ml-4 flex h-[24px] flex-1 flex-row items-center space-y-2 overflow-hidden px-1">
        <Spinner />
      </div>
    </div>
  );
}

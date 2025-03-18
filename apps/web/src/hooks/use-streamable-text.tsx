import { type StreamableValue, readStreamableValue } from 'ai/rsc';
import { useEffect, useState } from 'react';

/**
 * UseStreamableText Hook
 *
 * This hook handles streaming text content from either a string or a
 * StreamableValue, providing a unified interface for both static and streaming
 * text.
 *
 * @remarks
 *   The hook manages the state transitions for streaming content:
 *
 *   - For string inputs, it returns the string directly
 *   - For StreamableValue inputs, it progressively updates the content as new
 *       chunks arrive
 *
 *   This is particularly useful for AI-generated content that streams in chunks
 *   rather than being delivered all at once.
 * @example
 *   ```tsx
 *   // With a static string
 *   const text = useStreamableText("Hello world");
 *
 *   // With a streaming value from an AI response
 *   const streamingResponse = await ai.generateText();
 *   const text = useStreamableText(streamingResponse);
 *
 *   return <div>{text}</div>;
 *   ```;
 *
 * @param content - Either a static string or a StreamableValue that yields
 *   string chunks
 * @returns A string containing the current content, which updates as new chunks
 *   arrive when using a StreamableValue
 */
export const useStreamableText = (
  content: string | StreamableValue<string>
) => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  );

  useEffect(() => {
    (async () => {
      if (typeof content === 'object') {
        let value = '';
        for await (const delta of readStreamableValue(content)) {
          if (typeof delta === 'string') {
            await setRawContent((value = value + delta));
          }
        }
      }
    })();
  }, [content]);

  return rawContent;
};

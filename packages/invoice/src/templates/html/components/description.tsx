import { isValidJSON } from '../../../utils/content'
import { EditorContent } from './editor-content'

export function Description({ content }: { content: string }) {
  const value = isValidJSON(content) ? JSON.parse(content) : null

  // If the content is not valid JSON, return the content as a string
  if (!value) {
    return <div className="font-mono text-[11px] leading-4">{content}</div>
  }

  return <EditorContent content={value} />
}

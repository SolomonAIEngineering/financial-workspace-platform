'use client'

import { EditorDoc } from '../../types'
import { formatEditorContent } from '../format'
/** @jsxRuntime automatic */

export function EditorContent({ content }: { content?: EditorDoc }) {
  if (!content) {
    return null
  }

  return (
    <div className="font-mono leading-4">{formatEditorContent(content)}</div>
  )
}

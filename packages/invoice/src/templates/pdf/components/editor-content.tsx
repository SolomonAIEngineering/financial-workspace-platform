import { View } from '@react-pdf/renderer'
import { EditorDoc } from '../../types'
import { formatEditorContent } from '../format'

export function EditorContent({ content }: { content?: JSON }) {
  if (!content) {
    return null
  }

  return (
    <View style={{ marginTop: 10, lineHeight: 0.9 }}>
      {formatEditorContent(content as unknown as EditorDoc)}
    </View>
  )
}

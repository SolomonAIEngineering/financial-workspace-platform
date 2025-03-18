import { EditorDoc } from "@/templates/types";
import { formatEditorContent } from "../format";

export function EditorContent({ content }: { content?: JSON }) {
  if (!content) {
    return null;
  }

  return (
    <div className="flex" style={{ lineHeight: 1.5 }}>
      {formatEditorContent(content as unknown as EditorDoc)}
    </div>
  );
}

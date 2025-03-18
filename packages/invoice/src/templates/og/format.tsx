import type { EditorDoc } from "../types";

export function formatEditorContent(doc?: EditorDoc): JSX.Element | null {
  if (!doc || !doc.content) {
    return null;
  }

  return (
    <div className="flex flex-col text-white">
      {doc.content.map((node, nodeIndex) => {
        if (node.type === "paragraph") {
          return (
            <p
              key={`paragraph-${nodeIndex.toString()}`}
              className="flex flex-col mb-0"
            >
              {node.content?.map((inlineContent, inlineIndex) => {
                if (inlineContent.type === "text") {
                  let style = "text-[22px]";

                  if (inlineContent.marks) {
                    for (const mark of inlineContent.marks) {
                      if (mark.type === "bold") {
                        style += " font-medium";
                      } else if (mark.type === "italic") {
                        style += " italic";
                      }
                    }
                  }

                  if (inlineContent.text) {
                    return (
                      <span
                        key={`text-${nodeIndex}-${inlineIndex.toString()}`}
                        className={style}
                      >
                        {inlineContent.text}
                      </span>
                    );
                  }
                }

                if (inlineContent.type === "hardBreak") {
                  return (
                    <br key={`break-${nodeIndex}-${inlineIndex.toString()}`} />
                  );
                }

                return null;
              })}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

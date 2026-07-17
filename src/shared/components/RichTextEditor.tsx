import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  initialContent: string;
  onBlurContent: (html: string) => void;
  error?: string;
}

export function RichTextEditor({
  initialContent,
  onBlurContent,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onBlur: ({ editor }) => onBlurContent(editor.getHTML()),
  });

  if (!editor) return null;

  const toolbarButtons = [
    {
      label: "Bold",
      icon: Bold,
      isActive: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      isActive: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      isActive: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Bullet list",
      icon: List,
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div>
      <div
        className={`rounded-lg border bg-bg-base/50 ${
          error
            ? "border-danger"
            : "border-border-default focus-within:border-accent"
        }`}
      >
        <div className="flex gap-1 border-b border-border-default p-2">
          {toolbarButtons.map(({ label, icon: Icon, isActive, onClick }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={onClick}
              className={`rounded p-1.5 transition-colors duration-300 ${
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <EditorContent
          editor={editor}
          className="px-3 py-2 text-text-primary [&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:outline-none [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
      {error && <p className="mt-2 max-w-[92%] text-sm text-danger">{error}</p>}
    </div>
  );
}

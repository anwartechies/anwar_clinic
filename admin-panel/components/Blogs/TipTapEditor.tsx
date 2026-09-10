"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useCallback } from "react";
import {
  TbBold,
  TbItalic,
  TbStrikethrough,
  TbCode,
  TbH2,
  TbH3,
  TbList,
  TbListNumbers,
  TbBlockquote,
  TbMinus,
  TbLink,
  TbPhoto,
  TbArrowBackUp,
  TbArrowForwardUp,
  TbAlignLeft,
  TbAlignCenter,
  TbAlignRight,
} from "react-icons/tb";
import { MediaPicker } from "../Services/MediaPicker";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write your blog post content here…",
}: TipTapEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-teal-600 underline font-medium hover:text-teal-700",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-4 shadow-md",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[350px] w-full px-4 py-3 text-slate-800 dark:text-slate-200 outline-none leading-relaxed prose dark:prose-invert max-w-none text-[15px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleMediaPick = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor]
  );

  if (!editor) return null;

  const btnCls = (active: boolean) =>
    `p-1.5 rounded text-sm transition ${
      active
        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 font-semibold"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-950">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnCls(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <TbH2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnCls(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <TbH3 className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive("bold"))}
          title="Bold"
        >
          <TbBold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive("italic"))}
          title="Italic"
        >
          <TbItalic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnCls(editor.isActive("strike"))}
          title="Strikethrough"
        >
          <TbStrikethrough className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnCls(editor.isActive("code"))}
          title="Inline Code"
        >
          <TbCode className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btnCls(editor.isActive({ textAlign: "left" }))}
          title="Align Left"
        >
          <TbAlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btnCls(editor.isActive({ textAlign: "center" }))}
          title="Align Center"
        >
          <TbAlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btnCls(editor.isActive({ textAlign: "right" }))}
          title="Align Right"
        >
          <TbAlignRight className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnCls(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <TbList className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnCls(editor.isActive("orderedList"))}
          title="Numbered List"
        >
          <TbListNumbers className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnCls(editor.isActive("blockquote"))}
          title="Blockquote"
        >
          <TbBlockquote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnCls(false)}
          title="Horizontal Rule"
        >
          <TbMinus className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Link & Media */}
        <button
          type="button"
          onClick={setLink}
          className={btnCls(editor.isActive("link"))}
          title="Insert Link"
        >
          <TbLink className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setMediaPickerOpen(true)}
          className={btnCls(false)}
          title="Insert Image from Media Library"
        >
          <TbPhoto className="h-4 w-4" />
        </button>

        <span className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          title="Undo"
        >
          <TbArrowBackUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
          title="Redo"
        >
          <TbArrowForwardUp className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Body */}
      <EditorContent editor={editor} />

      {/* Media Picker Modal */}
      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onPick={handleMediaPick}
      />
    </div>
  );
}
